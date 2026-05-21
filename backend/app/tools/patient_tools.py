"""Outils patient pour le Diagnostic Agent."""

from langchain_core.tools import tool

QUESTION_TEMPLATES = [
    "Depuis combien de temps ressentez-vous ces symptômes ?",
    "Quelle est l'intensité de votre principal symptôme (échelle 1-10) ?",
    "Avez-vous de la fièvre ou des frissons ?",
    "Prenez-vous actuellement des médicaments ?",
    "Avez-vous des antécédents médicaux pertinents pour ce cas ?",
]


@tool
def ask_patient(question_index: int, patient_case: str) -> str:
    """Pose une question au patient (1 à 5). Retourne la formulation de la question."""
    if question_index < 1 or question_index > 5:
        return "Nombre de questions maximal atteint (5)."
    base = QUESTION_TEMPLATES[question_index - 1]
    return f"[Question {question_index}/5] {base} (Contexte: {patient_case[:120]}...)"
