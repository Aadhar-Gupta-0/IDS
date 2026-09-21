# Viva / Q&A Preparation

## 1. Why is this classification and not regression?
The target has two labelled outcomes: looking for a job change or not looking. Regression is for a continuous value such as salary, so binary classification fits this problem.

## 2. Why not use accuracy alone?
The target is roughly 75–25 imbalanced. A model could predict almost everyone as not looking and still appear accurate while missing the candidates HR cares about. That is why we also use F1, recall, precision and ROC-AUC.

## 3. Why use stratification?
The positive class is much smaller. Stratification keeps approximately the same class proportion in the train/test split and cross-validation folds, making the comparison more stable.

## 4. Why one-hot encode some variables and ordinal encode others?
One-hot encoding is for categories with no meaningful ranking, such as city or company type. Education and company size have a natural order, so ordinal treatment is more appropriate.

## 5. Why not delete rows with missing values?
Some columns have substantial missingness. Dropping all incomplete rows would throw away a lot of information and could bias the sample. Keeping an Unknown category preserves those candidates.

## 6. Why use a pipeline?
The main reason is leakage prevention. Imputation, encoding and scaling are fitted only on each training fold. Validation and test information therefore do not influence preprocessing.

## 7. Why cross-validation if there is already a test set?
Cross-validation is used to compare and tune models using training data only. The test set is kept for one final unbiased evaluation. Repeatedly choosing models using test performance would contaminate the test set.

## 8. Why use ROC-AUC for model selection?
HR can rank candidates by predicted probability rather than only make one yes/no decision at 0.5. ROC-AUC measures ranking quality across thresholds. We still inspect F1, precision and recall for the final operating threshold.

## 9. Which is worse: false positive or false negative?
They have different business costs. A false negative is a missed genuine job seeker, while a false positive wastes recruiter time. The preferred threshold depends on whether HR prioritises coverage or limited recruiter capacity.

## 10. Does feature importance prove what causes job searching?
No. Feature importance shows which variables help prediction in this dataset. It does not prove that changing a variable would cause someone to look for another job.

## Bonus — Why remove enrollee_id?
It is an identifier rather than a meaningful behavioural characteristic and could encourage accidental overfitting.

## Bonus — Why scale data if trees do not need scaling?
Scaling is important for Logistic Regression and KNN. A common pipeline allows fair comparison. Tree-based splits are not meaningfully harmed by the scaling.

## Bonus — Why not evaluate on Kaggle aug_test.csv?
It has no target label for ordinary evaluation, so we create a stratified hold-out set from aug_train.csv. The supplied test file can still be used later for predictions.
