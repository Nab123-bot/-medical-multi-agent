"""Client MCP pour récupérer des fiches conseils (outil obligatoire via MCP)."""

import json
from pathlib import Path

from langchain_core.tools import tool

# Chemin vers les données du serveur MCP local
GUIDELINES_PATH = (
    Path(__file__).resolve().parents[3] / "mcp_server" / "data" / "guidelines.json"
)


def _load_guidelines() -> dict:
    if GUIDELINES_PATH.exists():
        return json.loads(GUIDELINES_PATH.read_text(encoding="utf-8"))
    return {"general": ["Repos", "Hydratation", "Surveillance"]}


@tool
def get_care_guidelines_via_mcp(symptom_category: str) -> str:
    """
    Récupère des conseils généraux via MCP (protocole simulé par lecture des données MCP).
    Catégories: respiratoire, digestif, general, urgence.
    """
    data = _load_guidelines()
    category = symptom_category.lower().strip()
    tips = data.get(category, data.get("general", []))
    source = "MCP Server — medical-care-guidelines"
    formatted = "\n".join(f"- {t}" for t in tips)
    return f"[{source}]\nConseils pour '{category}':\n{formatted}"
