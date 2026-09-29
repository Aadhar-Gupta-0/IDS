# Viva Cheat Sheet

## 1. What is the business problem?
Prioritise which training-program candidates recruiters should contact first based on reported job-change intent.

## 2. Is this employee attrition?
No. These are candidates/trainees, not necessarily employees of the training company. The task is recruitment targeting, not employee attrition.

## 3. Why classification?
The target is binary: looking for a job change (1) or not (0). The model also outputs a probability-like ranking score.

## 4. Why not accuracy alone?
Only ~24.9% are positive. Predicting everyone as negative gives about 75% accuracy but detects zero job-seekers. We therefore report ROC-AUC, F1, precision and recall too.

## 5. What does ROC-AUC 0.8036 mean?
If we randomly choose one positive and one negative candidate, the model assigns the positive a higher score about 80% of the time.

## 6. Why stratified splitting?
To preserve the positive-class proportion across development/test data and CV folds.

## 7. What is leakage?
Any use of evaluation information during fitting, preprocessing, feature selection, tuning or threshold choice. We kept a locked 20% test split and used only development data for model/threshold selection.

## 8. Why not drop rows with missing values?
More than half the rows contain at least one missing field. Dropping them would discard a large, non-random subset. Missingness itself can carry signal.

## 9. Why the original models?
They satisfy the taught-model comparison: Dummy, Logistic Regression, Decision Tree, Random Forest and KNN.

## 10. Why CatBoost?
The data is highly categorical, contains missing values, and likely has nonlinear interactions. CatBoost handles categorical variables directly and performed better under leakage-safe validation.

## 11. Why three CatBoost seeds?
Averaging three independently seeded models reduces dependence on one random training trajectory. We did not choose the best seed after looking at test performance.

## 12. Which model is the final model?
The classroom benchmark selected Logistic Regression as the strongest conventional model. The deployed extension is the three-seed CatBoost ensemble. We report both separately.

## 13. Why is the deployment threshold 0.43 rather than 0.5?
0.43 was selected using out-of-fold development predictions to maximise validation accuracy. The locked test was not used to choose it.

## 14. Why is there another threshold, 0.314?
That validation-selected threshold maximises F1 and gives higher recall. Threshold choice is a business decision based on recruiter capacity and the cost of missed candidates versus unnecessary calls.

## 15. Final locked-test numbers?
CatBoost ensemble: ROC-AUC 0.8036; accuracy 80.19% at threshold 0.43; precision 58.91%; recall 67.85%; F1 0.6307. At the F1 threshold 0.314: recall 73.61%, F1 0.6394, accuracy 79.31%.

## 16. Original Logistic Regression on the same locked split?
ROC-AUC 0.7923. With its validation-selected accuracy threshold 0.632: accuracy 79.12%, recall 60.63%, F1 0.5914.

## 17. Is the gain huge?
No. ROC-AUC improves by about 0.011. That is a real but incremental gain, which is typical on a ~19k-row tabular dataset with limited features. Better data is likely more valuable than extreme additional tuning.

## 18. What are the strongest visible patterns?
City development index is the clearest single association in the EDA. Missing employer information also correlates with higher job-change rates. These are associations, not causal conclusions.

## 19. Is city safe to use?
It can proxy socioeconomic context. A real deployment would require subgroup performance/fairness auditing, governance and human review.

## 20. How is the website connected to the model?
HTML/CSS/JS sends a JSON profile to FastAPI `/api/predict`. The backend engineers the same features, loads three `.cbm` models, averages their predictions and returns the score to the browser.

## 21. What happens if Wi-Fi fails?
The classroom presentation can run completely on localhost. Internet is not needed for inference. The UI also has an explicitly labelled demo fallback, but the primary demo uses the actual backend model.

## 22. What would you improve next?
Collect longitudinal outcomes (did the candidate actually change jobs?), behavioural engagement features, richer employer/career context, external-cohort validation, probability calibration and subgroup fairness monitoring.
