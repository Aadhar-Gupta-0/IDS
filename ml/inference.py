from __future__ import annotations
import json
from pathlib import Path
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / 'outputs' / 'best_model'
EXPERIENCE_MAP = {'<1': 0.5, **{str(i): i for i in range(1, 21)}, '>20': 21.0}
LAST_JOB_MAP = {'never': 0.0, '1': 1.0, '2': 2.0, '3': 3.0, '4': 4.0, '>4': 5.0}
MISSING_SOURCE_COLS = ['gender','education_level','major_discipline','experience','company_size','company_type','last_new_job','enrolled_university']

def engineer_features(raw: pd.DataFrame) -> pd.DataFrame:
    X = raw.copy()
    for col in ['target', 'enrollee_id']:
        if col in X.columns:
            X = X.drop(columns=[col])
    X['experience_num'] = X['experience'].map(EXPERIENCE_MAP).astype(float)
    X['last_new_job_num'] = X['last_new_job'].map(LAST_JOB_MAP).astype(float)
    X['missing_count'] = X[MISSING_SOURCE_COLS].isna().sum(axis=1).astype(int)
    X['has_company_info'] = (X['company_size'].notna() & X['company_type'].notna()).astype(int)
    X['training_hours_log1p'] = np.log1p(X['training_hours'].astype(float))
    for col in X.select_dtypes(include=['object']).columns:
        X[col] = X[col].fillna('Unknown').astype(str)
    return X

class HRJobChangePredictor:
    def __init__(self, model_dir: str | Path = MODEL_DIR):
        self.model_dir = Path(model_dir)
        self.config = json.load(open(self.model_dir / 'config.json'))
        self.models = []
        for seed in self.config['model_seeds']:
            m = CatBoostClassifier()
            m.load_model(self.model_dir / f'catboost_seed_{seed}.cbm')
            self.models.append(m)

    def predict_proba(self, raw: pd.DataFrame) -> np.ndarray:
        X = engineer_features(raw)
        probs = [m.predict_proba(X)[:, 1] for m in self.models]
        return np.mean(probs, axis=0)

    def predict(self, raw: pd.DataFrame, threshold: float | None = None) -> np.ndarray:
        if threshold is None:
            threshold = self.config['accuracy_threshold']
        return (self.predict_proba(raw) >= threshold).astype(int)

    def predict_records(self, raw: pd.DataFrame) -> pd.DataFrame:
        p = self.predict_proba(raw)
        t_acc = self.config['accuracy_threshold']
        t_f1 = self.config['f1_threshold']
        out = pd.DataFrame({
            'job_change_probability': p,
            'predicted_class': (p >= t_acc).astype(int),
            'predicted_class_f1_threshold': (p >= t_f1).astype(int),
        })
        if 'enrollee_id' in raw.columns:
            out.insert(0, 'enrollee_id', raw['enrollee_id'].to_numpy())
        return out
