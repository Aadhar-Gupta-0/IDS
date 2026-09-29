# Job-Change Radar — Presentation Website + Live Model

Group 9 HR Analytics project for predicting reported job-change intent among data-science trainees.

## Project structure

- **Presentation Mode** — 9-scene, keyboard-controlled 8-minute presentation.
- **Explore / Technical Deep Dive** — detailed analysis, charts, threshold exploration and supporting explanations.
- **Live model** — FastAPI endpoint backed by a 3-seed CatBoost ensemble.
- **Academic benchmark** — the required baseline and taught-model comparison are retained separately from the deployment extension.

## Run locally

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

Open `http://127.0.0.1:8000`.

On Windows, `RUN_PRESENTATION.bat` performs the setup/start flow automatically.

## Presentation controls

- `Right Arrow`, `Space`, `PageDown`: next scene
- `Left Arrow`, `PageUp`: previous scene
- `F`: fullscreen
- `D`: jump to live model demo
- `R`: reset timer
- `Esc`: open the full project / technical deep dive
- `P`: return to Presentation Mode

## Deployment

This repository is prepared for Render using `render.yaml`.

- Build: `pip install --upgrade pip && pip install -r requirements.txt`
- Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/health`
- Runtime: Python 3.12

The model weights are committed under `model/`, so no external model download is required at startup.

## Team collaboration

Treat `main` as the stable presentation branch.

Recommended workflow:

```bash
git pull origin main
git checkout -b your-feature-name
# make and test changes
git add .
git commit -m "Describe the change"
git push -u origin your-feature-name
```

Open a pull request into `main` and merge only after the local website and `/api/predict` still work.

Avoid editing the `model/*.cbm` files unless intentionally retraining/replacing the deployment model.

## Reproducibility

- `ml/` contains training and inference scripts plus the Kaggle CSV files used for the enhanced model.
- `model/` contains deployment weights, config and frozen evaluation summaries.
- `resources/` contains the notebook, rendered notebook HTML, deck, viva material and course guideline PDF.

## Presenter material

- `docs/8_MINUTE_SPEAKER_SCRIPT.md`
- `docs/VIVA_CHEATSHEET.md`
- `docs/PRESENTATION_DAY_CHECKLIST.md`
- `docs/DEPLOYMENT_GUIDE.md`

## Local presentation recommendation

Even after the public deployment is live, use the local `127.0.0.1:8000` version for the classroom presentation so the model demo does not depend on venue Wi-Fi.
