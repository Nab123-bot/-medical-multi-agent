"""Superviseur : orchestre le workflow et décide de la prochaine étape."""

from typing import Literal

from app.state import MedicalState


def supervisor_node(state: MedicalState) -> dict:
    """Route vers l'agent métier approprié selon l'état du graphe."""
    if state.get("final_report"):
        return {"next": "FINISH"}

    if not state.get("diagnostic_summary"):
        return {"next": "diagnostic_agent"}

    if not state.get("physician_treatment"):
        return {"next": "physician_review"}

    if not state.get("final_report"):
        return {"next": "report_agent"}

    return {"next": "FINISH"}


def route_supervisor(state: MedicalState) -> Literal[
    "diagnostic_agent", "physician_review", "report_agent", "__end__"
]:
    nxt = state.get("next", "diagnostic_agent")
    if nxt == "FINISH":
        return "__end__"
    return nxt
