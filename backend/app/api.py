"""API FastAPI — format aligné avec le frontend React."""

import uuid
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver
from pydantic import BaseModel, Field

from app.llm_utils import generate_text
from app.tools.care_tools import recommend_interim_care
from app.tools.mcp_client import get_care_guidelines_via_mcp

app = FastAPI(
    title="Diagnostic Medical Multi-Agent API",
    description="Orientation clinique préliminaire — ne remplace pas une consultation médicale.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        "http://127.0.0.1:5175",
        "http://localhost:5175",
        "http://127.0.0.1:5176",
        "http://localhost:5176",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}

PATIENT_QUESTIONS = [
    "Depuis quand les symptômes ont-ils commencé ?",
    "Quelle est l'intensité des symptômes sur une échelle de 1 à 10 ?",
    "Avez-vous de la fièvre, une gêne respiratoire ou une douleur importante ?",
    "Avez-vous des antécédents médicaux, allergies ou traitements en cours ?",
    "Y a-t-il des signes d'aggravation ou des facteurs déclenchants ?",
]

DISCLAIMER = "Ce système ne remplace pas une consultation médicale."

# Stockage en mémoire des consultations (pédagogique)
_consultations: dict[str, dict[str, Any]] = {}
_checkpointer = MemorySaver()  # réservé pour LangGraph Studio


class SessionStartResponse(BaseModel):
    session_id: str


class ConsultationStartRequest(BaseModel):
    patient_case: str = Field(..., min_length=10)


class ConsultationResumeRequest(BaseModel):
    thread_id: str
    answer: str | None = None
    physician_treatment: str | None = None


def _build_response(state: dict) -> dict:
    count = state.get("question_count", 0)
    current = PATIENT_QUESTIONS[count] if count < 5 else None
    return {
        "thread_id": state["thread_id"],
        "patient_case": state["patient_case"],
        "questions": PATIENT_QUESTIONS,
        "patient_answers": state.get("patient_answers", []),
        "question_count": count,
        "current_question": current,
        "status": state["status"],
        "diagnostic_summary": state.get("diagnostic_summary"),
        "interim_care": state.get("interim_care"),
        "physician_treatment": state.get("physician_treatment"),
        "final_report": state.get("final_report"),
    }


def _run_diagnostic(state: dict) -> dict:
    answers_text = "\n".join(
        f"Q: {a['question']}\nR: {a['answer']}" for a in state["patient_answers"]
    )
    prompt = f"""Cas: {state['patient_case']}

Réponses:
{answers_text}

Rédige une SYNTHÈSE CLINIQUE PRÉLIMINAIRE (orientation prudente, pas de diagnostic définitif)."""

    summary = generate_text(
        "Agent pédagogique — orientation clinique préliminaire uniquement.",
        prompt,
        f"Synthèse clinique préliminaire\nCas initial: {state['patient_case'][:120]}...\n"
        f"{answers_text}",
    )

    category = (
        "respiratoire"
        if any(w in state["patient_case"].lower() for w in ["toux", "gorge", "respir"])
        else "general"
    )
    mcp = get_care_guidelines_via_mcp.invoke({"symptom_category": category})
    interim = recommend_interim_care.invoke({"symptoms_summary": summary})

    state["diagnostic_summary"] = summary
    state["interim_care"] = f"{interim}\n\n{mcp}"
    state["status"] = "awaiting_physician_review"
    state["current_question"] = None
    return state


def _run_report(state: dict) -> dict:
    prompt = f"""Rapport final structuré.

Cas: {state['patient_case']}
Synthèse: {state.get('diagnostic_summary', '')}
Recommandation: {state.get('interim_care', '')}
Médecin: {state.get('physician_treatment', '')}

Inclure le disclaimer: {DISCLAIMER}"""

    report = generate_text(
        "Rapport pédagogique sans diagnostic définitif.",
        prompt,
        f"""# Rapport final d'orientation clinique

## Cas patient
{state['patient_case']}

## Synthèse clinique préliminaire
{state.get('diagnostic_summary', '')}

## Recommandation intermédiaire
{state.get('interim_care', '')}

## Conduite médecin
{state.get('physician_treatment', '')}

## Disclaimer
{DISCLAIMER}
""",
    )
    if DISCLAIMER not in report:
        report = f"{report}\n\n{DISCLAIMER}"
    state["final_report"] = report
    state["status"] = "completed"
    return state


@app.post("/sessions/start", response_model=SessionStartResponse)
async def sessions_start():
    return SessionStartResponse(session_id=str(uuid.uuid4()))


@app.post("/consultation/start")
async def consultation_start(body: ConsultationStartRequest):
    thread_id = str(uuid.uuid4())
    state = {
        "thread_id": thread_id,
        "patient_case": body.patient_case,
        "patient_answers": [],
        "question_count": 0,
        "status": "collecting_patient_answers",
    }
    _consultations[thread_id] = state
    return _build_response(state)


@app.post("/consultation/resume")
async def consultation_resume(body: ConsultationResumeRequest):
    thread_id = body.thread_id
    state = _consultations.get(thread_id)
    if not state:
        raise HTTPException(status_code=404, detail="Consultation introuvable")

    if body.answer is not None:
        if state["status"] != "collecting_patient_answers":
            raise HTTPException(status_code=400, detail="Phase questions terminée")
        idx = state["question_count"]
        if idx >= 5:
            raise HTTPException(status_code=400, detail="5 questions déjà posées")
        state["patient_answers"].append(
            {"question": PATIENT_QUESTIONS[idx], "answer": body.answer}
        )
        state["question_count"] = idx + 1
        if state["question_count"] >= 5:
            state = _run_diagnostic(state)
    elif body.physician_treatment is not None:
        if state["status"] != "awaiting_physician_review":
            raise HTTPException(status_code=400, detail="En attente de la revue médecin")
        state["physician_treatment"] = body.physician_treatment
        state = _run_report(state)
    else:
        raise HTTPException(
            status_code=422,
            detail="Fournir 'answer' (patient) ou 'physician_treatment' (médecin)",
        )

    _consultations[thread_id] = state
    return _build_response(state)


@app.get("/consultation/{thread_id}")
async def get_consultation(thread_id: str):
    state = _consultations.get(thread_id)
    if not state:
        raise HTTPException(status_code=404, detail="Consultation introuvable")
    return _build_response(state)


@app.get("/consultation/{thread_id}/report")
async def get_report(thread_id: str):
    state = _consultations.get(thread_id)
    if not state:
        raise HTTPException(status_code=404, detail="Consultation introuvable")
    if not state.get("final_report"):
        raise HTTPException(status_code=400, detail="Rapport pas encore généré")
    return {
        "thread_id": thread_id,
        "final_report": state["final_report"],
        "disclaimer": DISCLAIMER,
    }
