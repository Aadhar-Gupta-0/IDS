# Slide Deck Outline

## Slide 1 — Business Question
- Predict which data-science trainees are looking for a job change
- Stakeholder: HR / Talent Acquisition
- Goal: prioritise recruiter outreach and training-to-hire budget
- Binary classification problem

## Slide 2 — Dataset
- Kaggle: HR Analytics — Job Change of Data Scientists
- 19,158 labelled training rows
- 13 predictors + binary target
- Profile, education, experience, company and training variables

## Slide 3 — Main Data Challenges
- Roughly 75% class 0 / 25% class 1
- Accuracy alone is misleading
- Significant missingness in company type, company size, gender and major discipline
- Keep incomplete rows instead of dropping a large part of the sample
- Visuals: target balance + missingness chart

## Slide 4 — EDA: What Differs?
- Compare target rates by education, experience, company size, company type and relevant experience
- Show 2–3 strongest actual plots from the notebook
- Association does not imply causation

## Slide 5 — Data Preparation
- Remove enrollee ID
- Missing categoricals → Unknown
- Numeric missing → median
- Experience: <1 → 0.5, >20 → 21
- Last job: never → 0, >4 → 5

## Slide 6 — Encoding and Leakage Prevention
- One-hot: city, gender, relevant experience, university, discipline, company type
- Ordinal: education level, company size
- StandardScaler for numeric features
- 80/20 stratified split
- ColumnTransformer + Pipeline
- Preprocessing fitted only on training folds

## Slide 7 — Models Compared
- Dummy baseline
- Logistic Regression
- Decision Tree
- Random Forest
- KNN
- 5-fold Stratified CV
- Metrics: F1 and ROC-AUC
- Add model-comparison chart

## Slide 8 — Model Selection
- Insert actual CV comparison table
- Selected model: **[fill after running]**
- Primary criterion: mean CV ROC-AUC
- F1 used as supporting metric
- Test set still untouched

## Slide 9 — Hyperparameter Tuning
- GridSearchCV
- Small, defensible search grid
- Insert before-vs-after F1 and ROC-AUC
- Best parameters: **[fill after running]**

## Slide 10 — Held-Out Test Results
- Accuracy = **[fill]**
- Precision = **[fill]**
- Recall = **[fill]**
- F1 = **[fill]**
- ROC-AUC = **[fill]**
- Add confusion matrix + ROC curve
- False negative = missed genuine job seeker
- False positive = unnecessary recruiter outreach

## Slide 11 — What Drives Predictions?
- Add permutation feature-importance chart
- Top five features = **[fill from notebook]**
- Predictive importance ≠ causal effect

## Slide 12 — Recommendations, Limitations and Team
### Recommendation
- Rank trainees by predicted job-search probability
- Choose outreach threshold based on recruiter capacity
- Lower threshold → higher recall
- Higher threshold → higher precision
- Monitor response/interview/hiring outcomes

### Limitations
- Imbalanced target
- Missing data
- No direct reason-for-leaving variable
- Geographic/generalisation limits
- Historical drift
- Fairness concerns
- Correlation ≠ causation

### Who did what
- Member 1 — Business understanding + EDA
- Member 2 — Data preparation + encoding
- Member 3 — Modelling + CV
- Member 4 — Tuning + evaluation
- Member 5 — Interpretation + slides
- All members reviewed the full pipeline
