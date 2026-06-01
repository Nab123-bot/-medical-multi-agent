#!/bin/bash
set -e
cd "$(dirname "$0")/../backend"

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

echo "API sur http://127.0.0.1:8000/docs"
uvicorn app.api:app --reload --host 127.0.0.1 --port 8000
