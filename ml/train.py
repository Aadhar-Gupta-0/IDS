from __future__ import annotations

import json
from pathlib import Path
from dataclasses import dataclass
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, log_loss, confusion_matrix
)

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / 'archive' / 'aug_train.csv'
MODEL_DIR = ROOT / 'outputs' / 'best_model'
RESULTS_DIR = ROOT / 'outputs'
MODEL_DIR.mkdir(parents=True, exist_ok=True)

SPLIT_SEED = 2026
MODEL_SEEDS = [2026, 3407, 9001]
TEST_SIZE = 0.20

BEST_PARAMS = {
    'iterations': 500,
    'depth': 7,
    'learning_rate': 0.03,
    'l2_leaf_reg': 5.0,
    'random_strength': 0.2,
    'bagging_temperature': 1.0,
    'loss_function': 'Logloss',
    'eval_metric': 'AUC',
    'verbose': False,
    'allow_writing_files': False,
    'thread_count': 4,
}

EXPERIENCE_MAP = {'<1': 0.5, **{str(i): i for i in range(1, 21)}, '>20': 21.0}
LAST_JOB_MAP = {'never': 0.0, '1': 1.0, '2': 2.0, '3': 3.0, '4': 4.0, '>4': 5.0}
MISSING_SOURCE_COLS = [
    'gender','education_level','major_discipline','experience','company_size',
    'company_type','last_new_job','enrolled_university'
]


def engineer_features(raw: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    X = raw.copy()
    for col in ['target', 'enrollee_id']:
        if col in X.columns:
            X = X.drop(columns=[col])

    X['experience_num'] = X['experience'].map(EXPERIENCE_MAP).astype(float)
    X['last_new_job_num'] = X['last_new_job'].map(LAST_JOB_MAP).astype(float)
    X['missing_count'] = X[MISSING_SOURCE_COLS].isna().sum(axis=1).astype(int)
    X['has_company_info'] = (X['company_size'].notna() & X['company_type'].notna()).astype(int)
    X['training_hours_log1p'] = np.log1p(X['training_hours'].astype(float))

    categorical = X.select_dtypes(include=['object']).columns.tolist()
    for col in categorical:
        X[col] = X[col].fillna('Unknown').astype(str)
    # CatBoost handles numeric NaN values natively.
    return X, categorical


def metric_row(y_true, prob, threshold, label):
    pred = (prob >= threshold).astype(int)
    return {
        'split': label,
        'threshold': float(threshold),
        'accuracy': accuracy_score(y_true, pred),
        'precision': precision_score(y_true, pred, zero_division=0),
        'recall': recall_score(y_true, pred, zero_division=0),
        'f1': f1_score(y_true, pred, zero_division=0),
        'roc_auc': roc_auc_score(y_true, prob),
        'pr_auc': average_precision_score(y_true, prob),
        'log_loss': log_loss(y_true, prob),
    }


def choose_threshold(y_true, prob, metric='accuracy'):
    grid = np.linspace(0.10, 0.90, 801)
    if metric == 'accuracy':
        scores = [accuracy_score(y_true, prob >= t) for t in grid]
    elif metric == 'f1':
        scores = [f1_score(y_true, prob >= t, zero_division=0) for t in grid]
    else:
        raise ValueError(metric)
    idx = int(np.argmax(scores))
    return float(grid[idx]), float(scores[idx])


def main():
    df = pd.read_csv(DATA_PATH)
    y = df['target'].astype(int)
    raw_X = df.drop(columns=['target'])

    # Locked test set. No model/hyperparameter/threshold choice uses this split.
    X_dev_raw, X_test_raw, y_dev, y_test = train_test_split(
        raw_X, y, test_size=TEST_SIZE, random_state=SPLIT_SEED, stratify=y
    )
    X_dev, cat_cols = engineer_features(X_dev_raw)
    X_test, _ = engineer_features(X_test_raw)

    # OOF predictions on the development set for honest threshold selection.
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SPLIT_SEED)
    oof = np.zeros(len(X_dev), dtype=float)
    fold_best_iterations = []
    fold_rows = []

    for fold, (tr_idx, va_idx) in enumerate(skf.split(X_dev, y_dev), start=1):
        X_tr, X_va = X_dev.iloc[tr_idx], X_dev.iloc[va_idx]
        y_tr, y_va = y_dev.iloc[tr_idx], y_dev.iloc[va_idx]
        model = CatBoostClassifier(**BEST_PARAMS, random_seed=SPLIT_SEED + fold)
        model.fit(
            X_tr, y_tr, cat_features=cat_cols,
            eval_set=(X_va, y_va), early_stopping_rounds=80, verbose=False
        )
        prob = model.predict_proba(X_va)[:, 1]
        oof[va_idx] = prob
        best_iter = int(model.best_iteration_ + 1) if model.best_iteration_ is not None else BEST_PARAMS['iterations']
        fold_best_iterations.append(best_iter)
        fold_rows.append({
            'fold': fold,
            'best_iteration': best_iter,
            'roc_auc': roc_auc_score(y_va, prob),
            'accuracy_at_0_5': accuracy_score(y_va, prob >= 0.5),
            'f1_at_0_5': f1_score(y_va, prob >= 0.5),
        })

    acc_threshold, oof_best_acc = choose_threshold(y_dev.to_numpy(), oof, 'accuracy')
    f1_threshold, oof_best_f1 = choose_threshold(y_dev.to_numpy(), oof, 'f1')
    final_iterations = int(np.median(fold_best_iterations))
    final_iterations = max(100, min(final_iterations, BEST_PARAMS['iterations']))

    # Train a small seed ensemble on all development data.
    models = []
    test_probs = []
    for seed in MODEL_SEEDS:
        p = dict(BEST_PARAMS)
        p['iterations'] = final_iterations
        p['random_seed'] = seed
        model = CatBoostClassifier(**p)
        model.fit(X_dev, y_dev, cat_features=cat_cols, verbose=False)
        models.append(model)
        test_probs.append(model.predict_proba(X_test)[:, 1])

    # Untouched test is evaluated here exactly once.
    test_prob = np.mean(test_probs, axis=0)
    metrics = [
        metric_row(y_dev, oof, 0.5, 'development_oof@0.5'),
        metric_row(y_dev, oof, acc_threshold, 'development_oof@accuracy_threshold'),
        metric_row(y_dev, oof, f1_threshold, 'development_oof@f1_threshold'),
        metric_row(y_test, test_prob, 0.5, 'locked_test@0.5'),
        metric_row(y_test, test_prob, acc_threshold, 'locked_test@accuracy_threshold'),
        metric_row(y_test, test_prob, f1_threshold, 'locked_test@f1_threshold'),
    ]
    metrics_df = pd.DataFrame(metrics)
    metrics_df.to_csv(RESULTS_DIR / 'enhanced_metrics.csv', index=False)
    pd.DataFrame(fold_rows).to_csv(RESULTS_DIR / 'cv_folds_enhanced.csv', index=False)

    pred_acc = (test_prob >= acc_threshold).astype(int)
    cm = confusion_matrix(y_test, pred_acc)
    pd.DataFrame(cm, index=['actual_0','actual_1'], columns=['pred_0','pred_1']).to_csv(
        RESULTS_DIR / 'confusion_matrix_locked_test.csv'
    )

    # Save each native model; this is robust and web-deployment friendly.
    for seed, model in zip(MODEL_SEEDS, models):
        model.save_model(MODEL_DIR / f'catboost_seed_{seed}.cbm')

    config = {
        'model_type': 'CatBoost seed ensemble',
        'model_seeds': MODEL_SEEDS,
        'split_seed': SPLIT_SEED,
        'test_size': TEST_SIZE,
        'primary_metric': 'ROC-AUC',
        'default_decision_metric': 'accuracy',
        'accuracy_threshold': acc_threshold,
        'f1_threshold': f1_threshold,
        'oof_best_accuracy': oof_best_acc,
        'oof_best_f1': oof_best_f1,
        'final_iterations': final_iterations,
        'cat_features': cat_cols,
        'feature_columns': X_dev.columns.tolist(),
        'params': {**BEST_PARAMS, 'iterations': final_iterations},
        'notes': 'Thresholds selected only from out-of-fold development predictions. Locked test used once after choices were fixed.'
    }
    with open(MODEL_DIR / 'config.json', 'w') as f:
        json.dump(config, f, indent=2)

    print('OOF AUC:', roc_auc_score(y_dev, oof))
    print('Accuracy threshold:', acc_threshold, 'OOF acc:', oof_best_acc)
    print('F1 threshold:', f1_threshold, 'OOF F1:', oof_best_f1)
    print('Final iterations:', final_iterations)
    print('\n', metrics_df.to_string(index=False))
    print('\nConfusion matrix @ accuracy threshold:\n', cm)

if __name__ == '__main__':
    main()
