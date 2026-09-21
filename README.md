# HR Analytics: Job Change of Data Scientists

Graduate-level Introduction to Data Science mid-sem project.

## Business objective
A company runs paid data-science training programmes and wants to estimate whether an enrollee is actively looking for a job change. The result helps HR/Talent Acquisition prioritise outreach and training-to-hire spend.

## Dataset
**Kaggle:** HR Analytics: Job Change of Data Scientists — arashnic  
https://www.kaggle.com/datasets/arashnic/hr-analytics-job-change-of-data-scientists

Place `aug_train.csv` inside `data/` before running the project. The supplied Kaggle `aug_test.csv` has no target and is not used for model evaluation.

## Repository structure

    IDS/
    ├── notebooks/
    │   └── GroupNo_HRJobChangePrediction.ipynb
    ├── src/
    │   ├── train_model.py
    │   └── predict.py
    ├── docs/
    │   ├── data_dictionary.md
    │   ├── slides_outline.md
    │   └── viva_qa.md
    ├── data/
    │   └── README.md
    ├── outputs/
    ├── artifacts/
    ├── .github/workflows/ci.yml
    ├── requirements.txt
    ├── .gitignore
    └── README.md

## Setup

    python -m venv .venv

Windows:

    .venv\Scripts\activate

macOS/Linux:

    source .venv/bin/activate

Install dependencies:

    pip install -r requirements.txt

## Run the notebook
Open `notebooks/GroupNo_HRJobChangePrediction.ipynb`, then use **Restart Kernel & Run All**.

## Run as a script

    python src/train_model.py

The script performs:
- stratified 80/20 train/test split,
- leakage-safe preprocessing with `ColumnTransformer` and `Pipeline`,
- missing-value handling,
- one-hot and ordinal encoding,
- numeric scaling,
- Dummy / Logistic Regression / Decision Tree / Random Forest / KNN comparison,
- 5-fold stratified cross-validation,
- GridSearchCV tuning,
- held-out evaluation,
- permutation feature importance,
- model export.

Outputs are written to `outputs/`; the fitted pipeline is written to `artifacts/final_model.pkl`.

## Predict on new candidates
After training:

    python src/predict.py path/to/new_candidates.csv outputs/predictions.csv

The input should contain the same raw predictor columns as `aug_train.csv` except `target`.

## Important interpretation
The target means **looking for a job change**. It does not directly measure future resignation, employee turnover, or suitability for a particular vacancy.

## Submission reminder
Rename `GroupNo` to the actual group number before submission.
