"""Human-in-the-loop : validation par le médecin traitant."""

from langgraph.types import interrupt

from app.state import MedicalState


def physician_review_node(state: MedicalState) -> dict:
    """
    Interruption obligatoire : le médecin reçoit la synthèse et la recommandation,
    puis propose un traitement ou une conduite à tenir.
    """
    payload = interrupt(
        {
            "type": "physician_review",
            "diagnostic_summary": state.get("diagnostic_summary", ""),
            "interim_care": state.get("interim_care", ""),
            "instruction": (
                "En tant que médecin traitant, validez ou ajustez l'orientation "
                "et proposez une conduite à tenir avant le rapport final."
            ),
        }
    )

    if isinstance(payload, dict):
        treatment = payload.get("physician_treatment") or payload.get("treatment", "")
    else:
        treatment = str(payload)

    return {
        "physician_treatment": treatment,
        "next": "report_agent",
    }
