"""Report Agent : rapport final structuré avec disclaimer obligatoire."""

from app.llm_utils import generate_text
from app.state import MedicalState

DISCLAIMER = "Ce système ne remplace pas une consultation médicale."


def report_agent_node(state: MedicalState) -> dict:
    """Génère le rapport final structuré."""
    prompt = f"""Rédige un RAPPORT FINAL STRUCTURÉ pour ce cas pédagogique.

Cas initial: {state.get('patient_case', '')}

Synthèse clinique préliminaire:
{state.get('diagnostic_summary', '')}

Recommandation intermédiaire:
{state.get('interim_care', '')}

Conduite proposée par le médecin:
{state.get('physician_treatment', '')}

Structure attendue:
1. Résumé du cas
2. Orientation clinique préliminaire
3. Recommandation intermédiaire rappelée
4. Conduite validée par le médecin
5. Points de surveillance
6. Disclaimer obligatoire: "{DISCLAIMER}"
"""

    fallback = f"""# Rapport final (mode démo)

## Résumé
{state.get('patient_case', '')}

## Orientation clinique préliminaire
{state.get('diagnostic_summary', '')}

## Recommandation intermédiaire
{state.get('interim_care', '')}

## Conduite médecin
{state.get('physician_treatment', '')}

## Disclaimer
{DISCLAIMER}
"""
    final_report = generate_text(
        "Tu rédiges un rapport pédagogique, sans diagnostic définitif.",
        prompt,
        fallback,
    )
    if DISCLAIMER not in final_report:
        final_report = f"{final_report}\n\n---\n{DISCLAIMER}"

    return {
        "final_report": final_report,
        "next": "FINISH",
    }
