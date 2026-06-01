#!/bin/bash
# Arrête les anciennes instances Vite et relance le frontend
set -e
cd "$(dirname "$0")/../frontend"

echo "Arrêt des anciens serveurs Vite (5173-5175)..."
for port in 5173 5174 5175; do
  pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null || true
  fi
done
sleep 1

if [ ! -d node_modules ]; then
  echo "Installation npm..."
  npm install
fi

echo "Démarrage sur http://127.0.0.1:5173"
echo "API attendue sur http://127.0.0.1:8000"
npm run dev
