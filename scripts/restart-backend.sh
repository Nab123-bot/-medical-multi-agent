#!/bin/bash
# Arrête l'ancienne API sur 8000 et relance la bonne version (avec CORS)
set -e
echo "Arrêt du processus sur le port 8000..."
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
sleep 1

cd "$(dirname "$0")/../backend"
source .venv/bin/activate
echo "Démarrage API avec CORS sur http://127.0.0.1:8000"
uvicorn app.api:app --reload --host 127.0.0.1 --port 8000
