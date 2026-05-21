"""Diagnostic Agent : 5 questions, synthèse préliminaire, recommandation intermédiaire."""

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.types import interrupt

from app.llm_utils import generate_text
from app.state import MedicalState
from app.tools.care_tools import recommend_interim_care
from app.tools.mcp_client import get_care_guidelines_via_mcp
from app.tools.patient_tools import ask_patient

SYSTEM_PROMPT = """Tu es un agent de diagnostic pédagogique (PAS un dispositif médical).
Tu produis une ORIENTATION CLINIQUE PRÉLIMINAIRE, jamais un diagnostic définitif.
Utilise uniquement : synthèse clinique préliminaire, orientation clinique préliminaire,
recommandation intermédiaire.
"""


def diagnostic_agent_node(state: MedicalState) -> dict:
    """
    Boucle de 5 questions via interrupt (human-in-the-loop patient),
    puis synthèse et recommandation intermédiaire.
    """
    patient_case = state.get("patient_case", "")
    question_count = state.get("question_count", 0)
    patient_answers = list(state.get("patient_answers", []))
    messages = list(state.get("messages", []))

    # Phase 1 : poser jusqu'à 5 questions (interrupt patient)
    while question_count < 5:
        question_text = ask_patient.invoke(
            {"question_index": question_count + 1, "patient_case": patient_case}
        )
        answer = interrupt(
            {
                "type": "patient_question",
                "question_index": question_count + 1,
                "question": question_text,
                "total": 5,
            }
        )
        if isinstance(answer, dict):
            answer_text = answer.get("answer", str(answer))
        else:
            answer_text = str(answer)

        patient_answers.append(
            {
                "index": question_count + 1,
                "question": question_text,
                "answer": answer_text,
            }
        )
        messages.append(AIMessage(content=question_text))
        messages.append(HumanMessage(content=answer_text))
        question_count += 1

    # Phase 2 : synthèse clinique préliminaire (LLM)
    answers_text = "\n".join(
        f"Q{a['index']}: {a['question']}\nR: {a['answer']}" for a in patient_answers
    )
    synthesis_prompt = f"""Cas patient initial:
{patient_case}

Réponses collectées:
{answers_text}

Produis une SYNTHÈSE CLINIQUE PRÉLIMINAIRE (5-8 lignes).
Ne pose pas de diagnostic définitif. Orientation prudente uniquement."""

    fallback = (
        f"Orientation clinique préliminaire (mode démo): cas '{patient_case[:80]}...' "
        f"avec {len(patient_answers)} réponses collectées. "
        "Poursuivre la surveillance et avis médical si aggravation."
    )
    diagnostic_summary = generate_text(SYSTEM_PROMPT, synthesis_prompt, fallback)

    # Phase 3 : recommandation intermédiaire + MCP
    category = "respiratoire" if any(
        w in patient_case.lower() for w in ["toux", "gorge", "respir"]
    ) else "general"
    mcp_guidelines = get_care_guidelines_via_mcp.invoke({"symptom_category": category})
    interim = recommend_interim_care.invoke({"symptoms_summary": diagnostic_summary})
    interim_care = f"{interim}\n\nRéférentiel MCP:\n{mcp_guidelines}"

    messages.append(
        AIMessage(
            content=f"Synthèse clinique préliminaire:\n{diagnostic_summary}\n\n"
            f"Recommandation intermédiaire:\n{interim_care}"
        )
    )

    return {
        "question_count": question_count,
        "patient_answers": patient_answers,
        "diagnostic_summary": diagnostic_summary,
        "interim_care": interim_care,
        "messages": messages,
        "needs_patient_input": False,
        "next": "physician_review",
    }
