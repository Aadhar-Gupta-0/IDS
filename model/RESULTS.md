# Enhanced Deployable Model Results

## Goal
Improve the existing HR Analytics job-change classifier without changing the project story or required classroom modelling section. The original scikit-learn models remain in the project; the deployable model is an added advanced extension.

## Evaluation protocol
- Dataset: `archive/aug_train.csv` (19,158 labelled rows).
- Target: `target` (1 = looking for a job change, 0 = not looking for a job change).
- Locked test split: 20%, stratified, `random_state=2026`.
- The locked test was not used for model selection or threshold tuning.
- Model/threshold selection used only the 80% development partition.
- Thresholds were selected from 5-fold out-of-fold development predictions.
- Final deployable predictor averages 3 CatBoost models trained with seeds 2026, 3407 and 9001.

## Why ROC-AUC is primary
The target is imbalanced (~25% positive), so raw accuracy can hide poor detection of candidates who may change jobs. ROC-AUC is used as the primary model-selection metric, while accuracy, F1, precision, recall and PR-AUC are reported too.

## Baseline vs enhanced model on the same locked test

| Model | Threshold | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---:|---:|---:|---:|---:|---:|
| Original tuned Logistic Regression | 0.500 | 0.7636 | 0.5177 | 0.7497 | 0.6125 | 0.7923 |
| Original Logistic Regression + OOF accuracy threshold | 0.632 | 0.7912 | 0.5773 | 0.6063 | 0.5914 | 0.7923 |
| Enhanced CatBoost ensemble | 0.500 | 0.7993 | 0.5957 | 0.6063 | 0.6009 | 0.8036 |
| **Enhanced CatBoost ensemble (default deployment)** | **0.430** | **0.8019** | **0.5891** | **0.6785** | **0.6307** | **0.8036** |
| Enhanced CatBoost ensemble (F1 threshold) | 0.314 | 0.7931 | 0.5651 | 0.7361 | 0.6394 | 0.8036 |

### Improvement over the original default model on the same locked test
- Accuracy: **76.36% -> 80.19%** (+3.84 percentage points)
- ROC-AUC: **0.7923 -> 0.8036** (+0.0112)
- F1: **0.6125 -> 0.6307** (+0.0182)
- Precision: **0.5177 -> 0.5891**
- Recall: **0.7497 -> 0.6785** at the accuracy-optimised deployment threshold.

The F1-optimised threshold (0.314) is also stored if the website/business prefers to catch more potential job changers: it raises recall to 0.7361 and F1 to 0.6394, with 79.31% accuracy.

## Cross-validation / out-of-fold development result
- 5-fold OOF ROC-AUC: **0.8056**
- OOF accuracy-optimised threshold: **0.430**
- OOF accuracy at that threshold: **0.8014**
- OOF F1-optimised threshold: **0.314**
- OOF F1 at that threshold: **0.6371**

Fold ROC-AUCs: 0.8096, 0.8007, 0.8001, 0.8117, 0.8058.

## Final model
CatBoost was selected because this dataset is dominated by categorical variables, contains substantial missingness, and includes non-linear interactions. It can consume categorical values directly rather than exploding them into a large sparse one-hot matrix.

Validated additions kept in the deployable feature set:
- Numeric representation of `experience`
- Numeric representation of `last_new_job`
- `missing_count`
- `has_company_info`
- `log1p(training_hours)`

Raw categorical columns are also retained, so the model can learn non-linear category interactions without losing the original information.

## Reproducibility
Run:

```bash
python train.py
```

Deploy/infer with:

```bash
python predict.py archive/aug_test.csv outputs/predictions.csv
```

For a website/backend, import:

```python
from inference import HRJobChangePredictor
predictor = HRJobChangePredictor()
probabilities = predictor.predict_proba(dataframe)
predictions = predictor.predict(dataframe)
```

## Deployment files
`outputs/best_model/` contains:
- `catboost_seed_2026.cbm`
- `catboost_seed_3407.cbm`
- `catboost_seed_9001.cbm`
- `config.json`

`inference.py` defines the stable prediction interface.

## Notes / limitations
- Kaggle's supplied `aug_test.csv` has no target labels, so it is used only for producing predictions, not for evaluation.
- The historical notebook's reported ROC-AUC (~0.808) used a different split, so it should not be compared directly against the new locked-test number. The table above compares both models on the exact same new locked split.
- This is a tabular dataset with ~19k rows; improvements beyond this point are likely to be incremental without new, more predictive features or additional labelled data.
