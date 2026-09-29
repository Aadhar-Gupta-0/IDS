#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate
python -m pip install --disable-pip-version-check -q -r requirements.txt
python -m uvicorn server:app --host 127.0.0.1 --port 8000
