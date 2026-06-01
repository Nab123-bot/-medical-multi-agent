# Démarrage rapide

## Ouvrir le code dans Cursor

**Fichier → Ouvrir le dossier** puis choisir :

```
/Users/macbookair/Projects/medical-multi-agent
```

Fichiers principaux :

| Fichier | Rôle |
|---------|------|
| `frontend/src/App.jsx` | Interface React (4 écrans) |
| `frontend/src/api/client.js` | Appels API |
| `backend/app/api.py` | API FastAPI |
| `backend/app/graph.py` | Graphe LangGraph (Studio) |
| `backend/app/nodes/*.py` | Agents |

## Lancer l'application (2 terminaux)

### Terminal 1 — Backend

```bash
cd /Users/macbookair/Projects/medical-multi-agent/backend
source .venv/bin/activate
uvicorn app.api:app --reload --port 8000
```

Si `python` / `pip` introuvables, utilisez `python3` :

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.api:app --reload --port 8000
```

### Terminal 2 — Frontend

```bash
bash /Users/macbookair/Projects/medical-multi-agent/scripts/start-frontend.sh
```

Ouvrez **exactement** : **http://127.0.0.1:5173** (avec les deux-points avant le port).

## En cas de page blanche ou bug

1. Vérifiez que le **backend** tourne : http://127.0.0.1:8000/docs  
2. Utilisez **la même URL** que celle affichée par `npm run dev` (5173, 5174 ou 5175).  
3. Rechargez la page après avoir relancé les deux serveurs.
