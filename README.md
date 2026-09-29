# Job-Change Radar — Presentation Website + Live Model

This folder is the presentation-ready version of the Group 9 HR Analytics website.

## What changed

- Default **8-minute Presentation Mode** with 9 keyboard-controlled scenes.
- Original detailed website retained as **Explore / Viva Mode**.
- Live `/api/predict` endpoint using the final **3-seed CatBoost ensemble**.
- Deployment-model metrics are separated from the original classroom benchmark.
- Presenter HUD shows scene count and elapsed time.
- Offline fallback is explicitly labelled as a demo fallback and is never presented as a model prediction.

## Run locally

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`.

## Presentation controls

- `Right Arrow`, `Space`, `PageDown`: next scene
- `Left Arrow`, `PageUp`: previous scene
- `F`: browser fullscreen
- `D`: jump to live model demo
- `R`: reset presentation timer
- `Esc`: exit Presentation Mode into the full project website
- `P`: re-enter Presentation Mode

## Deployment

Use any Python host that can run FastAPI and CatBoost (Render, Railway, Fly.io, a VM, etc.). Start command:

```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

The model weights are already in `model/`.

## Fastest Windows workflow

For presentation day, you do **not** need to type terminal commands:

1. Double-click `RUN_PRESENTATION.bat`.
2. The first run creates `.venv`, installs dependencies and opens the browser.
3. The local app runs at `http://127.0.0.1:8000`.
4. Run `VERIFY_PROJECT.bat` before the final rehearsal.

## Reproducibility bundle

The `ml/` folder contains the labelled/unlabelled CSV files and the training/inference scripts used for the enhanced CatBoost model. This is separate from the lightweight live-serving code in `server.py`.

## Presenter material

- `docs/8_MINUTE_SPEAKER_SCRIPT.md` — exact presentation narration and timing.
- `docs/VIVA_CHEATSHEET.md` — core technical questions and safe answers.
- `docs/PRESENTATION_DAY_CHECKLIST.md` — final-day operating checklist.
- `docs/DEPLOYMENT_GUIDE.md` — prepared online-deployment workflow.
