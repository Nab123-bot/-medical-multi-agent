"""Recommandation intermédiaire prudente."""

from langchain_core.tools import tool

DISCLAIMER = (
    "Cette recommandation ne remplace pas l'avis d'un médecin. "
    "En cas d'aggravation, consultez rapidement un professionnel de santé."
)


@tool
def recommend_interim_care(symptoms_summary: str) -> str:
    """Propose une recommandation intermédiaire prudente (repos, hydratation, surveillance)."""
    summary_lower = symptoms_summary.lower()
    red_flags = [
        "douleur thoracique",
        "difficulté respiratoire",
        "confusion",
        "perte de conscience",
        "saignement",
        "fièvre élevée",
    ]
    if any(flag in summary_lower for flag in red_flags):
        advice = (
            "Signes potentiellement préoccupants détectés. "
            "Consultation médicale rapide recommandée. "
            "Surveillez l'évolution des symptômes en continu."
        )
    else:
        advice = (
            "Repos, hydratation suffisante et surveillance des symptômes. "
            "Consultez un médecin si les symptômes persistent ou s'aggravent."
        )
    return f"{advice}\n\n{DISCLAIMER}"
