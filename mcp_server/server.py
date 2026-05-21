"""
Serveur MCP — outil obligatoire get_care_guidelines.
Lancement: python mcp_server/server.py
"""

import json
from pathlib import Path

from mcp.server.fastmcp import FastMCP

DATA_PATH = Path(__file__).parent / "data" / "guidelines.json"
mcp = FastMCP("medical-care-guidelines", host="127.0.0.1", port=8765)


def _load() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


@mcp.tool()
def get_care_guidelines(symptom_category: str) -> str:
    """Retourne des conseils généraux par catégorie de symptômes."""
    data = _load()
    tips = data.get(symptom_category.lower(), data["general"])
    return json.dumps({"category": symptom_category, "guidelines": tips}, ensure_ascii=False)


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
