# Système multi-agents médical avec LangGraph

Projet pédagogique — **orientation clinique préliminaire** (non dispositif médical).

**Superviseur** : Pr. Mohamed YOUSSFI

## Architecture

```
medical-multi-agent/
├── backend/          # LangGraph + FastAPI
├── mcp_server/       # Outil MCP get_care_guidelines
├── frontend/         # React (4 écrans)
└── README.md
```

### Agents

| Agent | Rôle |
|-------|------|
| **Supervisor** | Orchestre le flux |
| **Diagnostic Agent** | 5 questions (`ask_patient`), synthèse, recommandation intermédiaire |
| **Physician Review** | Human-in-the-loop médecin |
| **Report Agent** | Rapport final + disclaimer |

### Workflow

`START → Supervisor → DiagnosticAgent → Supervisor → PhysicianReview → Supervisor → ReportAgent → END`

## Prérequis

- Python 3.11+
- Node.js 18+
- Clé API OpenAI
- [LangGraph CLI](https://langchain-ai.github.io/langgraph/cloud/reference/cli/) (optionnel, pour Studio)

## Installation

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env     # puis renseigner OPENAI_API_KEY
```

### Serveur MCP (obligatoire)

```bash
pip install mcp
python ../mcp_server/server.py
```

### API FastAPI

```bash
cd backend
uvicorn app.api:app --reload --port 8000
```

### Frontend React

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173

## API (endpoints obligatoires)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/sessions/start` | Nouvelle session |
| POST | `/consultation/start` | Démarre avec `patient_case` |
| POST | `/consultation/resume` | Reprend après interrupt patient/médecin |
| GET | `/consultation/{thread_id}` | État courant |
| GET | `/consultation/{thread_id}/report` | Rapport final |

## LangGraph Studio

```bash
cd backend
pip install langgraph-cli
langgraph dev
```

Ouvrir l’UI Studio pour visualiser le graphe `medical_multi_agent`, tester les interruptions patient et médecin.

## Jeux de tests (scénarios attendus)

1. **Syndrome respiratoire simple** — toux, fatigue, pas de fièvre  
2. **Red flags** — douleur thoracique, dyspnée, confusion  
3. **Cas bénin** — symptômes légers, surveillance  

Pour chaque scénario vérifier : 5 questions, recommandation intermédiaire, revue médecin, rapport avec disclaimer.

## Avertissement éthique

Ce système est un **exercice académique**. Il ne fournit **pas** de diagnostic définitif. Le rapport inclut : *« Ce système ne remplace pas une consultation médicale »*.

## Livrables

- Code backend, MCP, frontend
- Ce README
- Rapport technique (à rédiger par l’équipe)
