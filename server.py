from pathlib import Path
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict
from catboost import CatBoostClassifier

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "model"

EXPERIENCE_MAP = {'<1': 0.5, **{str(i): i for i in range(1, 21)}, '>20': 21.0}
LAST_JOB_MAP = {'never': 0.0, '1': 1.0, '2': 2.0, '3': 3.0, '4': 4.0, '>4': 5.0}
MISSING_SOURCE_COLS = ['gender','education_level','major_discipline','experience','company_size','company_type','last_new_job','enrolled_university']

with open(MODEL_DIR / "config.json", encoding="utf-8") as f:
    CONFIG = json.load(f)
MODELS = []
for seed in CONFIG['model_seeds']:
    m = CatBoostClassifier()
    m.load_model(str(MODEL_DIR / f"catboost_seed_{seed}.cbm"))
    MODELS.append(m)

class Candidate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    city: str = 'city_103'
    city_development_index: float = 0.92
    gender: str | None = None
    relevent_experience: str = 'Has relevent experience'
    enrolled_university: str = 'no_enrollment'
    education_level: str = 'Graduate'
    major_discipline: str | None = 'STEM'
    experience: str = '5'
    company_size: str | None = None
    company_type: str | None = None
    last_new_job: str | None = '1'
    training_hours: float = 50


def engineer_features(raw: pd.DataFrame) -> pd.DataFrame:
    X = raw.copy()
    X['experience_num'] = X['experience'].map(EXPERIENCE_MAP).astype(float)
    X['last_new_job_num'] = X['last_new_job'].map(LAST_JOB_MAP).astype(float)
    X['missing_count'] = X[MISSING_SOURCE_COLS].isna().sum(axis=1).astype(int)
    X['has_company_info'] = (X['company_size'].notna() & X['company_type'].notna()).astype(int)
    X['training_hours_log1p'] = np.log1p(X['training_hours'].astype(float))
    for col in X.select_dtypes(include=['object']).columns:
        X[col] = X[col].fillna('Unknown').astype(str)
    return X[CONFIG['feature_columns']]

app = FastAPI(title='Job-Change Radar', version='2.0')

@app.get('/api/health')
def health():
    return {'ok': True, 'model_type': CONFIG['model_type'], 'models': len(MODELS)}

@app.post('/api/predict')
def predict(candidate: Candidate):
    try:
        raw = pd.DataFrame([candidate.model_dump()])
        X = engineer_features(raw)
        probs = [float(m.predict_proba(X)[0, 1]) for m in MODELS]
        p = float(np.mean(probs))
        return {
            'job_change_probability': p,
            'predicted_class': int(p >= CONFIG['accuracy_threshold']),
            'accuracy_threshold': CONFIG['accuracy_threshold'],
            'f1_threshold': CONFIG['f1_threshold'],
            'ensemble_member_probabilities': probs,
            'model_type': CONFIG['model_type'],
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@app.get('/')
def root():
    return FileResponse(ROOT / 'index.html')

# Mount static assets after API routes.
app.mount('/', StaticFiles(directory=ROOT, html=True), name='static')
