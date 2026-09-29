// Auto-generated content data for the Group 9 HR Analytics site.
const VIVA = [["business",0,"What is the business problem, in one sentence?","A company that trains data scientists wants to hire from its own trainees, and it needs to know which trainees are looking for a new job so recruiters can focus on them.","Say the decision it supports: <b>who recruiters contact first</b>."],["business",0,"Who are the people in this dataset? Are they the company's employees?","No. They are candidates who signed up for the company's training courses. Most of them work somewhere else. <code>target = 1</code> means the candidate is looking for a job change, which makes them a likely hire for this company.","Common trap: calling it an 'employee attrition' model. It is closer to <b>recruitment targeting</b>."],["business",0,"Why is this a classification problem and not regression?","The target has two values: looking for a job change or not. The model outputs a probability, and we turn it into a yes/no decision with a threshold."],["business",0,"Why didn't you use accuracy to judge the models?","Only 24.9% of candidates are looking to move. A model that always says 'not looking' gets 75.1% accuracy and finds nobody. Our model's accuracy is 76.9%, which looks barely better, yet it finds 78% of job-seekers. ROC-AUC and F1 show that difference and accuracy hides it."],["business",0,"Explain ROC-AUC = 0.81 to a manager with no statistics background.","Pick one candidate who is looking to move and one who is not, at random. About 81% of the time the model gives the job-seeker the higher score. 50% would be a coin flip and 100% would be perfect.","This is the exact definition, so it is safe to say word for word."],["business",0,"Which is worse here: a false positive or a false negative?","A false positive costs a recruiter a call to someone who is not interested, which is cheap. A false negative is a missed hire, which is more expensive. That is why we used class weighting and accepted lower precision (52%) for higher recall (78%)."],["business",1,"What is the business value in plain numbers?","If a recruiter calls candidates at random, about 25 in every 100 are looking to move. In the model's flagged list about 52 in every 100 are, which is 2.1 times better. It still finds 78% of all job-seekers while flagging 37% of candidates.","Lift = precision / base rate = 0.524 / 0.249 = <b>2.1</b>."],["business",1,"If you had to present one number to HR, which would it be and why?","Recall at the chosen threshold, because it answers their question directly: out of everyone who wants to move, how many will we reach? At 0.5 that is 78%. Then give precision (52%) so they know how much recruiter time goes to people who are not interested."],["data",0,"Describe the dataset.","19,158 labelled candidates with 14 columns: an ID, 12 features and the target. There is also a file of 2,129 unlabelled candidates. Features cover the city (code and development index), gender, relevant experience, university enrolment, education level, major, years of experience, current company size and type, years since last job change and training hours."],["data",0,"What did you find in the data before modelling?","Three things: the target is imbalanced (25% positive); four columns have a lot of missing data (company_type 32%, company_size 31%, gender 23.5%, major 14.7%); and city_development_index is the clearest single signal. Cities below 0.60 have a 58% job-change rate, while cities at 0.90 and above have 17%."],["data",0,"Why do you think people in less developed cities want to change jobs more?","Likely fewer good local jobs, so people train to move to better opportunities. That is our interpretation. The data only shows a correlation, not the reason.","Always add the word <b>correlation</b>. Teachers love to push on causation here."],["data",0,"Is training_hours useful?","Almost not. Its correlation with the target is -0.02, and shuffling it lowers test ROC-AUC by only 0.0008. People who train more are not more or less likely to move."],["data",0,"How are city and city_development_index related?","Every city has exactly one development index value, so the index is a numeric summary of the city. We kept both: the index works for rare cities, and the city columns capture effects specific to each city."],["data",1,"Did you check for duplicates?","Yes. There are no exact duplicate rows, no duplicate IDs, and no candidate appears in both files. 49 rows (0.26%) are identical apart from the ID. Since most columns are coarse categories, two different people can have the same profile, so we kept them."],["data",1,"The files are called aug_train and aug_test. Is the data augmented or synthetic?","The names suggest the data may have been augmented, but we could not confirm how. We treated it as real data. If some rows were generated, that would be a limitation, because duplicated patterns could make scores look better than they are. We did check that exact duplicates are not a problem.","Honest uncertainty scores better than a made-up answer."],["data",1,"Why is 'relevent' spelled wrong?","That is how the column and its values are spelled in the source data. We kept it so the code matches the original files."],["data",1,"What does last_new_job = 'never' mean?","The source does not say whether it means 'never changed jobs' or 'never had a job'. We mapped it to 0 (below 1 year). Its job-change rate is 30%, above average, which fits better with people early in their careers."],["prep",0,"Why didn't you simply drop the rows with missing values?","53% of rows have at least one missing value, so we would lose more than half the data. Worse, the rows we would lose are different: dropping them lowers the job-change rate from 24.9% to 16.6%. The model would learn from a biased sample."],["prep",0,"Why fill missing categories with 'Unknown' instead of the most common value?","Because missing values carry information. Candidates with no company_size have a 40.6% job-change rate, compared with 17.9% when it is recorded. Filling with the mode would hide that signal. An 'Unknown' level lets the model learn it."],["prep",0,"What is data leakage and how did you prevent it?","Leakage is when information from the evaluation data influences training, which makes scores look too good. All imputers, encoders and scalers are inside a scikit-learn Pipeline, so in cross-validation they are fitted only on the training folds, and the test set is transformed with what was learned from training data."],["prep",0,"Explain your encoding choices.","Nominal columns with no order (city, gender, relevant experience, enrolment, major, company type) are one-hot encoded. Ordered categories (education level, company size) are ordinal encoded. Experience and last_new_job were converted to numbers because their categories are years. Numeric columns are median-filled and standardised."],["prep",0,"Why stratified splitting?","It keeps the 24.9% job-change rate the same in the training set (15,326 rows) and test set (3,832 rows), and in every cross-validation fold. Without it, a split could by chance have noticeably more or fewer job-seekers."],["prep",0,"Why standardise numeric columns?","Logistic regression with regularisation penalises coefficient size, so features need a comparable scale. KNN uses distances, so a column with a large range would dominate. Trees do not need scaling, but it does not hurt them."],["prep",1,"city has 123 categories. Isn't one-hot encoding it a problem?","It creates 122 columns (one city only appears in the test split), and rare cities get noisy coefficients. Regularisation (C = 0.1) keeps those small. Better options for the next version would be target encoding or grouping rare cities. <code>handle_unknown='ignore'</code> means an unseen city does not crash the model."],["prep",1,"You put 'Unknown' at the bottom of the ordered scale for company_size. Isn't that wrong?","Yes, it is a simplification. The model treats 'Unknown' as a company smaller than '<10', which has no real meaning, and 'Unknown' actually has the highest job-change rate (41%). We tested one-hot encoding for education and company size instead: cross-validated ROC-AUC went from 0.791 to 0.794. It is a small gain, and we would switch in the next version.","Admitting a flaw and showing you measured it is the strongest possible answer."],["prep",1,"The ordinal columns are not scaled but the numeric ones are. Does that matter?","Education is coded 0 to 5 and company size 0 to 8, while scaled columns have a standard deviation of 1. For KNN this means company size carries more weight in the distance. For logistic regression it changes how strongly regularisation affects those two coefficients. It is a known weakness of our pipeline, and one-hot encoding those columns removes it."],["prep",1,"Why is '<1' year of experience mapped to 0.5 and '>20' to 21?","0.5 is the middle of 'less than a year'. For '>20' we picked 21 as a conservative value just above the top category. The exact choice matters little, because the job-change rate is almost flat above 15 years."],["prep",1,"Why didn't you use SMOTE or oversampling for the imbalance?","We used <code>class_weight='balanced'</code>, which weights job-seekers about 2.0 and others about 0.67 in the loss. It has a similar effect without creating synthetic rows. SMOTE also works poorly with many one-hot columns, because it interpolates between 0/1 values."],["model",0,"Why these five models?","A dummy baseline to set the floor, logistic regression as a simple interpretable model, a decision tree for non-linear rules, a random forest as a strong ensemble, and KNN as a distance-based method. Together they cover the main model families taught in the course."],["model",0,"Explain logistic regression simply.","It adds up the features, each multiplied by a weight, and passes the total through an S-shaped curve that turns it into a probability between 0 and 1. Positive weights push towards 'looking to move', negative weights push away."],["model",0,"What do C and the penalty mean?","C controls regularisation: a smaller C means stronger regularisation, which keeps weights small and the model simpler. L2 shrinks all weights a bit. L1 can set weak ones exactly to zero. The best combination was C = 0.1 with L2."],["model",0,"Why did you choose logistic regression over random forest?","The top three models were within 0.007 ROC-AUC of each other, about one standard deviation between folds, so there is no real performance difference. Logistic regression was slightly ahead, had the best F1, is fast, and can be explained through its weights. That matters when HR asks why someone was flagged."],["model",0,"What is 5-fold stratified cross-validation?","The training data is split into 5 parts with the same class balance. The model trains on 4 parts and is scored on the fifth, five times, so every row is used for validation once. We report the mean and the standard deviation of the 5 scores."],["model",0,"Why did the decision tree score only 0.62?","It was not pruned, so it grew until it memorised the training folds: it overfits. Limiting max_depth or min_samples_leaf would improve it, but we only tuned the model that won the comparison."],["model",0,"How did you tune the model?","GridSearchCV over C (0.01, 0.1, 1, 10) and penalty (L1, L2): 8 combinations times 5 folds, 40 fits. It chose the combination with the best mean ROC-AUC and refitted it on the full training set."],["model",1,"You only tuned the winner. Could a tuned random forest have beaten it?","Possibly. The untuned random forest was only 0.006 behind, so tuning it might close or reverse the gap. We chose not to because the models were already within one standard deviation and logistic regression is easier to explain. A fairer comparison would tune every model with the same budget. That is in our next steps."],["model",1,"Why did you refit on ROC-AUC and not F1?","ROC-AUC measures how well the model ranks candidates across all thresholds. F1 depends on one threshold (0.5). We wanted the best ranking first and to choose the threshold separately as a business decision."],["model",1,"What does class_weight='balanced' do to the probabilities?","It makes them too high. The average predicted probability on the test set is 0.45, while the real rate is 0.25. The ranking is still good (ROC-AUC is unaffected), but the numbers should not be read as true probabilities. To use them as real probabilities we would calibrate the model, for example with CalibratedClassifierCV.","Very few groups know this one."],["model",1,"Did you try a stronger model beyond the models taught in class?","Yes. We kept the taught-model comparison for the academic benchmark, then added a 3-seed CatBoost ensemble as a deployment extension. It improved locked-test ROC-AUC from 0.7923 for the fresh Logistic Regression baseline to 0.8036. We present it as an extension, not as a replacement for the required course models."],["results",0,"Walk us through the confusion matrix.","Out of 3,832 test candidates: 748 job-seekers correctly flagged (true positives), 207 job-seekers missed (false negatives), 680 flagged who are not looking (false positives), and 2,197 correctly left alone (true negatives). Recall is 748 / 955 = 78%. Precision is 748 / 1,428 = 52%."],["results",0,"Is your model overfitting?","No. Training ROC-AUC is 0.797, cross-validation 0.791 and test 0.808. All three are close. Overfitting would show as a much higher training score than test score."],["results",0,"How would you choose the threshold?","From recruiter capacity and the cost of a miss. At 0.5 we flag 37% of candidates and catch 78% of job-seekers. At 0.7 we flag 21% and catch 51%, with precision rising from 52% to 60%. F1 is highest around 0.5 to 0.6."],["results",0,"What drives the predictions?","Permutation importance on the test set: city_development_index is the biggest by far (shuffling it lowers ROC-AUC by 0.10), then company_type (0.05) and city (0.05). Training hours, last_new_job and gender add almost nothing."],["results",0,"What is permutation importance and why use it instead of coefficients?","We shuffle one original column in the test set and measure how much ROC-AUC drops. It works for any model and scores a column as a whole, for example all 122 city dummies together, which is easier to explain than individual encoded columns."],["results",1,"Your test ROC-AUC (0.808) is higher than cross-validation (0.791). Isn't that suspicious?","It is chance in how the split fell. We re-ran the whole split with 5 different random seeds: test ROC-AUC ranged from 0.784 to 0.809, mean 0.795. Seed 42 happens to be at the top of that range. So the honest expectation for new data is about 0.79 to 0.80.","Say this before they find it. It shows you understand variance."],["results",1,"Could a simple rule do just as well, like 'flag everyone in a city below 0.7'?","No. That rule flags 25% of candidates with 51% precision and 51% recall. The model at threshold 0.7 has the same recall (51%) but flags fewer people (21%) at higher precision (60%). Used alone, city_development_index gives a ROC-AUC of 0.69, while the full model reaches 0.81."],["results",1,"Who are the 207 job-seekers the model missed?","They look like people who stay. Their median city development index is 0.91 (for correctly caught job-seekers it is 0.62), 78% have a recorded employer (40% for caught ones), and their median experience is 10 years (5 for caught ones). The model cannot tell these movers apart with the features we have."],["results",1,"city_development_index is a perfect function of the city columns. How can you interpret its coefficient?","You can't, fully. Because every city has one index value, the index is an exact linear combination of the city dummies. Without regularisation the coefficients would not be uniquely defined. L2 regularisation decides how the effect is split between the index and the city columns. So we read the index coefficient as the general trend and the city coefficients as each city's deviation from it, and we rely on permutation importance for the ranking.","This is the hardest question in the set."],["results",1,"city_103 has a positive coefficient but only a 21% job-change rate, below average. Why?","Coefficients are relative to everything else in the model. city_103 has a high development index (0.92), and other cities that developed have a 13% rate. Compared with them, 21% is high, so the city coefficient is positive after accounting for the index."],["results",1,"What is the odds interpretation of the city_development_index coefficient?","The coefficient is -0.61 per standard deviation (0.12 on the index). exp(-0.61) = 0.54, so a city about 0.12 more developed roughly halves the odds of a job change, holding the other features fixed. Given the collinearity with the city columns, treat this as a rough guide."],["results",1,"Why is major_discipline = Unknown the strongest negative coefficient?","Candidates with no major are mostly people with no university degree: 72% of them have High School as their education and 11% Primary School. Their job-change rate is 20%, below average. So 'no major' works as a marker of lower education in this data."],["results",1,"Why did you compute the threshold table on the test set? Doesn't that break your own rule?","Yes, if we used it to choose the threshold. We only used it to show the trade-off, and the notebook says so. In practice we would choose the threshold using cross-validated predictions on the training data, then confirm it once on the test set."],["ethics",0,"Should gender be in the model at all?","We would remove it before real use. It is a protected attribute and the model barely uses it: it has the lowest permutation importance (0.0006), and retraining without it changes test ROC-AUC only from 0.8085 to 0.8082."],["ethics",0,"Could this model be unfair to people from poorer cities?","Yes, city and its development index can stand in for socio-economic background. For outreach, meaning 'who do we call first', the risk is low. If it were used to reject people, it would be a problem. We would audit error rates by city group before any real use."],["ethics",0,"What are the main limitations?","About half of flagged candidates are false positives; the probabilities are inflated by class weighting; the data comes from one programme at one point in time; the threshold was illustrated on test data; and a couple of encoding shortcuts (Unknown as the lowest category, unscaled ordinal codes) cost a little accuracy."],["ethics",0,"What would you do with two more weeks?","Validate the CatBoost extension on a genuinely new cohort; add longitudinal/behavioural features; audit fairness by subgroup; calibrate probabilities; and choose operating thresholds from recruiter capacity and business costs on validation data."],["ethics",1,"Is it ethical to predict whether someone wants to leave their job?","It depends on who uses it. Here the company is predicting interest among its own trainees to offer them a job, which helps the candidate. If a current employer used a similar model to watch its staff, the privacy concerns would be much bigger. Candidates should know how their training data is used."],["ethics",1,"How would you deploy and monitor this model?","The deployment extension is a 3-seed CatBoost ensemble served behind a Python API. The website sends one candidate profile to <code>/api/predict</code> and receives a score. In production we would version the model, validate each new cohort, track precision/recall and calibration against later outcomes, and monitor drift in cities, missingness and class prevalence."],["ethics",1,"Does training cause people to leave their jobs?","Our data cannot answer that. It shows who is looking, not why. Training hours have almost no relationship with job change, which weakly suggests the training itself is not what pushes people to move."],["code",0,"What does ColumnTransformer do?","It applies different preprocessing to different groups of columns and joins the results into one matrix. We used three branches: nominal (Unknown fill and one-hot), ordinal (Unknown fill and ordered codes) and numeric (median fill and scaling)."],["code",0,"What is the difference between fit, transform and fit_transform?","fit learns parameters from data, for example the median or the list of categories. transform applies them. fit_transform does both on the same data. We only fit on training data and only transform the test data, which prevents leakage."],["code",0,"What does handle_unknown='ignore' do?","If a category appears that was not in the training data, such as a new city, its one-hot columns are all zero instead of raising an error. The candidate is still scored using the other features."],["code",0,"Does the notebook run from top to bottom?","Yes. It was checked with Restart and Run All from a fresh kernel, including from a folder that contains only the notebook and the CSVs. All 27 code cells run without errors."],["code",1,"What does random_state = 42 do, and would another value change your results?","It fixes the randomness in the split, the folds and the models, so results can be reproduced. Another value gives slightly different numbers: test ROC-AUC ranged from 0.784 to 0.809 across 5 seeds. The conclusions do not change."],["code",1,"Is saving the model with pickle safe?","Only for files you trust, because loading a pickle can run code. It also depends on library versions, so we pinned them in <code>requirements.txt</code>. For a production system, a format like ONNX or a model registry would be safer."]];

const SITE = {
 "cityBins": [
  {
   "label": "Below 0.60",
   "value": 0.579,
   "n": 725
  },
  {
   "label": "0.60 – 0.70",
   "value": 0.497,
   "n": 3831
  },
  {
   "label": "0.70 – 0.80",
   "value": 0.247,
   "n": 1410
  },
  {
   "label": "0.80 – 0.90",
   "value": 0.136,
   "n": 3549
  },
  {
   "label": "0.90 and up",
   "value": 0.168,
   "n": 9643
  }
 ],
 "experience": [
  [
   "<1",
   0.454,
   522
  ],
  [
   "1",
   0.424,
   549
  ],
  [
   "2",
   0.332,
   1127
  ],
  [
   "3",
   0.353,
   1354
  ],
  [
   "4",
   0.326,
   1403
  ],
  [
   "5",
   0.288,
   1430
  ],
  [
   "6",
   0.282,
   1216
  ],
  [
   "7",
   0.295,
   1028
  ],
  [
   "8",
   0.243,
   802
  ],
  [
   "9",
   0.217,
   980
  ],
  [
   "10",
   0.21,
   985
  ],
  [
   "11",
   0.227,
   664
  ],
  [
   "12",
   0.186,
   494
  ],
  [
   "13",
   0.193,
   399
  ],
  [
   "14",
   0.183,
   586
  ],
  [
   "15",
   0.166,
   686
  ],
  [
   "16",
   0.142,
   508
  ],
  [
   "17",
   0.167,
   342
  ],
  [
   "18",
   0.154,
   280
  ],
  [
   "19",
   0.174,
   304
  ],
  [
   "20",
   0.223,
   148
  ],
  [
   ">20",
   0.153,
   3286
  ]
 ],
 "missing": [
  {
   "col": "company_type",
   "pct": 32.0,
   "missing": 0.3883,
   "present": 0.1838
  },
  {
   "col": "company_size",
   "pct": 31.0,
   "missing": 0.4059,
   "present": 0.179
  },
  {
   "col": "gender",
   "pct": 23.5,
   "missing": 0.3081,
   "present": 0.2313
  },
  {
   "col": "major_discipline",
   "pct": 14.7,
   "missing": 0.1952,
   "present": 0.2587
  },
  {
   "col": "education_level",
   "pct": 2.4,
   "missing": 0.2261,
   "present": 0.2499
  },
  {
   "col": "last_new_job",
   "pct": 2.2,
   "missing": 0.3641,
   "present": 0.2468
  },
  {
   "col": "enrolled_university",
   "pct": 2.0,
   "missing": 0.3187,
   "present": 0.2479
  },
  {
   "col": "experience",
   "pct": 0.3,
   "missing": 0.3538,
   "present": 0.249
  }
 ],
 "models": [
  {
   "name": "Logistic Regression",
   "roc": 0.789,
   "roc_sd": 0.0103,
   "f1": 0.6065,
   "f1_sd": 0.0107,
   "note": "Simple, fast, explainable"
  },
  {
   "name": "KNN",
   "roc": 0.7829,
   "roc_sd": 0.0111,
   "f1": 0.5454,
   "f1_sd": 0.0056,
   "note": "Classifies by similar candidates"
  },
  {
   "name": "Random Forest",
   "roc": 0.7826,
   "roc_sd": 0.0108,
   "f1": 0.5882,
   "f1_sd": 0.0149,
   "note": "300 trees averaged"
  },
  {
   "name": "Decision Tree",
   "roc": 0.6161,
   "roc_sd": 0.0139,
   "f1": 0.4236,
   "f1_sd": 0.0212,
   "note": "Memorised its homework"
  },
  {
   "name": "Dummy",
   "roc": 0.5,
   "roc_sd": 0.0,
   "f1": 0.0,
   "f1_sd": 0.0,
   "note": "Always says “not looking”"
  }
 ],
 "dictionary": [
  [
   "enrollee_id",
   "ID",
   "1 to 33,380, unique",
   "0%",
   "Unique ID of the candidate. Dropped — an ID predicts nothing."
  ],
  [
   "city",
   "Nominal",
   "123 city codes, e.g. city_103",
   "0%",
   "City the candidate lives in. One-hot encoded."
  ],
  [
   "city_development_index",
   "Numeric",
   "0.448 to 0.949",
   "0%",
   "Development index of the city, 0 to 1. The single strongest signal."
  ],
  [
   "gender",
   "Nominal",
   "Male, Female, Other",
   "23.5%",
   "Gender of the candidate. Sensitive attribute — dropped before real use."
  ],
  [
   "relevent_experience",
   "Binary",
   "Has / No relevent experience",
   "0%",
   "Relevant experience to data science (spelling from the source)."
  ],
  [
   "enrolled_university",
   "Nominal",
   "no_enrollment, Full time, Part time",
   "2.0%",
   "Type of university course, if any."
  ],
  [
   "education_level",
   "Ordinal",
   "Primary School → Phd",
   "2.4%",
   "Highest education level, ordered codes."
  ],
  [
   "major_discipline",
   "Nominal",
   "STEM, Humanities, Business, Arts, Other, No Major",
   "14.7%",
   "Main subject studied."
  ],
  [
   "experience",
   "Ordinal (text)",
   "<1, 1 to 20, >20",
   "0.3%",
   "Total work experience in years → converted to years."
  ],
  [
   "company_size",
   "Ordinal (text)",
   "<10 up to 10000+",
   "31.0%",
   "Employees at the current employer, ordered codes."
  ],
  [
   "company_type",
   "Nominal",
   "Pvt Ltd, Funded Startup, Early Stage, Public Sector, NGO, Other",
   "32.0%",
   "Type of current employer."
  ],
  [
   "last_new_job",
   "Ordinal (text)",
   "never, 1, 2, 3, 4, >4",
   "2.2%",
   "Years between previous and current job → converted to years."
  ],
  [
   "training_hours",
   "Numeric",
   "1 to 336",
   "0%",
   "Training hours completed. Almost no predictive power."
  ],
  [
   "target",
   "Binary label",
   "0 or 1",
   "0%",
   "1 = looking for a job change, 0 = not looking. The label."
  ]
 ],
 "roadmap": [
  [
   "01",
   "Setup",
   "Libraries, RANDOM_STATE = 42, one shared plot style.",
   "READ"
  ],
  [
   "02",
   "Load the data",
   "aug_train.csv (19,158 rows), aug_test.csv (2,129), sample_submission.csv.",
   "READ"
  ],
  [
   "03",
   "Data dictionary",
   "Every column typed, with missingness and meaning.",
   "READ"
  ],
  [
   "04",
   "Data quality checks",
   "Duplicates, missingness, and what missing values are worth.",
   "CHART"
  ],
  [
   "05",
   "Target distribution",
   "4,777 looking (24.9%) vs 14,381 not (75.1%).",
   "CHART"
  ],
  [
   "06",
   "Exploratory analysis",
   "Rates by city, experience, education, company and more.",
   "CHART"
  ],
  [
   "07",
   "Feature engineering",
   "Text → years, drop the ID, 14 inputs prepared.",
   "BUILD"
  ],
  [
   "08",
   "Train / test split",
   "80/20 stratified: 15,326 train, 3,832 test.",
   "SPLIT"
  ],
  [
   "09",
   "Preprocessing pipeline",
   "One-hot, ordinal codes, median fill, scaling — inside CV folds.",
   "BUILD"
  ],
  [
   "10",
   "Model comparison",
   "Five models, 5-fold stratified cross-validation.",
   "SCORE"
  ],
  [
   "11",
   "Hyperparameter tuning",
   "GridSearchCV on C and penalty: 0.789 → 0.791.",
   "TUNE"
  ],
  [
   "12",
   "Test evaluation",
   "One look at the hold-out set: ROC-AUC 0.808.",
   "SCORE"
  ],
  [
   "13",
   "What drives it?",
   "Permutation importance and coefficients.",
   "CHART"
  ],
  [
   "14",
   "Score the new file",
   "2,129 unlabelled candidates ranked for HR.",
   "SHIP"
  ],
  [
   "15",
   "Save the model",
   "artifacts/final_model.pkl, verified after reload.",
   "SHIP"
  ],
  [
   "16",
   "Conclusions",
   "What HR should do — and what it should not.",
   "WRITE"
  ]
 ],
 "roc": {
  "fpr": [
   0.0,
   0.0049,
   0.0094,
   0.0146,
   0.0188,
   0.0226,
   0.0285,
   0.0323,
   0.0372,
   0.0424,
   0.049,
   0.0549,
   0.0619,
   0.0685,
   0.073,
   0.0779,
   0.0841,
   0.0879,
   0.0935,
   0.0987,
   0.1032,
   0.1091,
   0.114,
   0.122,
   0.1262,
   0.1314,
   0.1383,
   0.146,
   0.1515,
   0.1578,
   0.1641,
   0.1738,
   0.1807,
   0.1898,
   0.2009,
   0.2058,
   0.2117,
   0.2245,
   0.2423,
   0.2656,
   0.2774,
   0.2948,
   0.318,
   0.341,
   0.3618,
   0.3903,
   0.422,
   0.4609,
   0.4904,
   0.5276,
   0.5662,
   0.6093,
   0.6774,
   0.7098,
   0.7602,
   0.805,
   0.886,
   0.9409,
   0.9659,
   1.0
  ],
  "tpr": [
   0.0,
   0.0209,
   0.0461,
   0.0649,
   0.0869,
   0.1099,
   0.1277,
   0.1508,
   0.178,
   0.2147,
   0.2408,
   0.2691,
   0.2911,
   0.311,
   0.3351,
   0.3613,
   0.3759,
   0.3969,
   0.4115,
   0.4325,
   0.4534,
   0.4848,
   0.5183,
   0.5372,
   0.5518,
   0.5644,
   0.5906,
   0.6126,
   0.6262,
   0.6461,
   0.6691,
   0.6848,
   0.6995,
   0.712,
   0.7246,
   0.7403,
   0.7571,
   0.7749,
   0.7853,
   0.7969,
   0.8105,
   0.8209,
   0.8304,
   0.8398,
   0.8503,
   0.8597,
   0.8691,
   0.8785,
   0.888,
   0.8984,
   0.911,
   0.9215,
   0.9309,
   0.9403,
   0.9497,
   0.9592,
   0.9696,
   0.9791,
   0.9885,
   1.0
  ]
 },
 "auc": 0.8085,
 "train_auc": 0.7966,
 "dense": [
  {
   "t": 0.2,
   "share": 0.8421,
   "prec": 0.2835,
   "rec": 0.9581,
   "f1": 0.4376,
   "tp": 915,
   "fp": 2312,
   "fn": 40,
   "tn": 565
  },
  {
   "t": 0.21,
   "share": 0.8244,
   "prec": 0.2881,
   "rec": 0.9529,
   "f1": 0.4424,
   "tp": 910,
   "fp": 2249,
   "fn": 45,
   "tn": 628
  },
  {
   "t": 0.22,
   "share": 0.8053,
   "prec": 0.2936,
   "rec": 0.9487,
   "f1": 0.4484,
   "tp": 906,
   "fp": 2180,
   "fn": 49,
   "tn": 697
  },
  {
   "t": 0.23,
   "share": 0.7855,
   "prec": 0.3003,
   "rec": 0.9466,
   "f1": 0.456,
   "tp": 904,
   "fp": 2106,
   "fn": 51,
   "tn": 771
  },
  {
   "t": 0.24,
   "share": 0.7651,
   "prec": 0.3056,
   "rec": 0.9382,
   "f1": 0.461,
   "tp": 896,
   "fp": 2036,
   "fn": 59,
   "tn": 841
  },
  {
   "t": 0.25,
   "share": 0.7427,
   "prec": 0.3124,
   "rec": 0.9309,
   "f1": 0.4678,
   "tp": 889,
   "fp": 1957,
   "fn": 66,
   "tn": 920
  },
  {
   "t": 0.26,
   "share": 0.7208,
   "prec": 0.3211,
   "rec": 0.9288,
   "f1": 0.4773,
   "tp": 887,
   "fp": 1875,
   "fn": 68,
   "tn": 1002
  },
  {
   "t": 0.27,
   "share": 0.6973,
   "prec": 0.3312,
   "rec": 0.9267,
   "f1": 0.488,
   "tp": 885,
   "fp": 1787,
   "fn": 70,
   "tn": 1090
  },
  {
   "t": 0.28,
   "share": 0.6754,
   "prec": 0.3377,
   "rec": 0.9152,
   "f1": 0.4934,
   "tp": 874,
   "fp": 1714,
   "fn": 81,
   "tn": 1163
  },
  {
   "t": 0.29,
   "share": 0.6587,
   "prec": 0.3451,
   "rec": 0.912,
   "f1": 0.5007,
   "tp": 871,
   "fp": 1653,
   "fn": 84,
   "tn": 1224
  },
  {
   "t": 0.3,
   "share": 0.637,
   "prec": 0.3548,
   "rec": 0.9068,
   "f1": 0.51,
   "tp": 866,
   "fp": 1575,
   "fn": 89,
   "tn": 1302
  },
  {
   "t": 0.31,
   "share": 0.6177,
   "prec": 0.3625,
   "rec": 0.8984,
   "f1": 0.5166,
   "tp": 858,
   "fp": 1509,
   "fn": 97,
   "tn": 1368
  },
  {
   "t": 0.32,
   "share": 0.5979,
   "prec": 0.3719,
   "rec": 0.8921,
   "f1": 0.525,
   "tp": 852,
   "fp": 1439,
   "fn": 103,
   "tn": 1438
  },
  {
   "t": 0.33,
   "share": 0.5819,
   "prec": 0.3789,
   "rec": 0.8848,
   "f1": 0.5306,
   "tp": 845,
   "fp": 1385,
   "fn": 110,
   "tn": 1492
  },
  {
   "t": 0.34,
   "share": 0.5647,
   "prec": 0.3877,
   "rec": 0.8785,
   "f1": 0.538,
   "tp": 839,
   "fp": 1325,
   "fn": 116,
   "tn": 1552
  },
  {
   "t": 0.35,
   "share": 0.5454,
   "prec": 0.401,
   "rec": 0.8775,
   "f1": 0.5504,
   "tp": 838,
   "fp": 1252,
   "fn": 117,
   "tn": 1625
  },
  {
   "t": 0.36,
   "share": 0.5303,
   "prec": 0.4085,
   "rec": 0.8691,
   "f1": 0.5557,
   "tp": 830,
   "fp": 1202,
   "fn": 125,
   "tn": 1675
  },
  {
   "t": 0.37,
   "share": 0.513,
   "prec": 0.4191,
   "rec": 0.8628,
   "f1": 0.5642,
   "tp": 824,
   "fp": 1142,
   "fn": 131,
   "tn": 1735
  },
  {
   "t": 0.38,
   "share": 0.4995,
   "prec": 0.4274,
   "rec": 0.8565,
   "f1": 0.5702,
   "tp": 818,
   "fp": 1096,
   "fn": 137,
   "tn": 1781
  },
  {
   "t": 0.39,
   "share": 0.4838,
   "prec": 0.438,
   "rec": 0.8503,
   "f1": 0.5781,
   "tp": 812,
   "fp": 1042,
   "fn": 143,
   "tn": 1835
  },
  {
   "t": 0.4,
   "share": 0.4726,
   "prec": 0.4456,
   "rec": 0.845,
   "f1": 0.5835,
   "tp": 807,
   "fp": 1004,
   "fn": 148,
   "tn": 1873
  },
  {
   "t": 0.41,
   "share": 0.4609,
   "prec": 0.4524,
   "rec": 0.8366,
   "f1": 0.5873,
   "tp": 799,
   "fp": 967,
   "fn": 156,
   "tn": 1910
  },
  {
   "t": 0.42,
   "share": 0.4491,
   "prec": 0.4625,
   "rec": 0.8335,
   "f1": 0.5949,
   "tp": 796,
   "fp": 925,
   "fn": 159,
   "tn": 1952
  },
  {
   "t": 0.43,
   "share": 0.4428,
   "prec": 0.4667,
   "rec": 0.8293,
   "f1": 0.5973,
   "tp": 792,
   "fp": 905,
   "fn": 163,
   "tn": 1972
  },
  {
   "t": 0.44,
   "share": 0.4319,
   "prec": 0.4749,
   "rec": 0.823,
   "f1": 0.6023,
   "tp": 786,
   "fp": 869,
   "fn": 169,
   "tn": 2008
  },
  {
   "t": 0.45,
   "share": 0.4217,
   "prec": 0.4845,
   "rec": 0.8199,
   "f1": 0.6091,
   "tp": 783,
   "fp": 833,
   "fn": 172,
   "tn": 2044
  },
  {
   "t": 0.46,
   "share": 0.4084,
   "prec": 0.4933,
   "rec": 0.8084,
   "f1": 0.6127,
   "tp": 772,
   "fp": 793,
   "fn": 183,
   "tn": 2084
  },
  {
   "t": 0.47,
   "share": 0.3972,
   "prec": 0.5,
   "rec": 0.7969,
   "f1": 0.6145,
   "tp": 761,
   "fp": 761,
   "fn": 194,
   "tn": 2116
  },
  {
   "t": 0.48,
   "share": 0.3867,
   "prec": 0.5108,
   "rec": 0.7927,
   "f1": 0.6213,
   "tp": 757,
   "fp": 725,
   "fn": 198,
   "tn": 2152
  },
  {
   "t": 0.49,
   "share": 0.3776,
   "prec": 0.5183,
   "rec": 0.7853,
   "f1": 0.6245,
   "tp": 750,
   "fp": 697,
   "fn": 205,
   "tn": 2180
  },
  {
   "t": 0.5,
   "share": 0.3727,
   "prec": 0.5238,
   "rec": 0.7832,
   "f1": 0.6278,
   "tp": 748,
   "fp": 680,
   "fn": 207,
   "tn": 2197
  },
  {
   "t": 0.51,
   "share": 0.3666,
   "prec": 0.5281,
   "rec": 0.777,
   "f1": 0.6288,
   "tp": 742,
   "fp": 663,
   "fn": 213,
   "tn": 2214
  },
  {
   "t": 0.52,
   "share": 0.3622,
   "prec": 0.5339,
   "rec": 0.7759,
   "f1": 0.6325,
   "tp": 741,
   "fp": 647,
   "fn": 214,
   "tn": 2230
  },
  {
   "t": 0.53,
   "share": 0.3544,
   "prec": 0.5412,
   "rec": 0.7696,
   "f1": 0.6355,
   "tp": 735,
   "fp": 623,
   "fn": 220,
   "tn": 2254
  },
  {
   "t": 0.54,
   "share": 0.3479,
   "prec": 0.5431,
   "rec": 0.7581,
   "f1": 0.6329,
   "tp": 724,
   "fp": 609,
   "fn": 231,
   "tn": 2268
  },
  {
   "t": 0.55,
   "share": 0.3398,
   "prec": 0.5445,
   "rec": 0.7424,
   "f1": 0.6283,
   "tp": 709,
   "fp": 593,
   "fn": 246,
   "tn": 2284
  },
  {
   "t": 0.56,
   "share": 0.3343,
   "prec": 0.5449,
   "rec": 0.7309,
   "f1": 0.6243,
   "tp": 698,
   "fp": 583,
   "fn": 257,
   "tn": 2294
  },
  {
   "t": 0.57,
   "share": 0.3288,
   "prec": 0.546,
   "rec": 0.7204,
   "f1": 0.6212,
   "tp": 688,
   "fp": 572,
   "fn": 267,
   "tn": 2305
  },
  {
   "t": 0.58,
   "share": 0.321,
   "prec": 0.5537,
   "rec": 0.7131,
   "f1": 0.6233,
   "tp": 681,
   "fp": 549,
   "fn": 274,
   "tn": 2328
  },
  {
   "t": 0.59,
   "share": 0.3116,
   "prec": 0.5611,
   "rec": 0.7016,
   "f1": 0.6235,
   "tp": 670,
   "fp": 524,
   "fn": 285,
   "tn": 2353
  },
  {
   "t": 0.6,
   "share": 0.3032,
   "prec": 0.5654,
   "rec": 0.688,
   "f1": 0.6207,
   "tp": 657,
   "fp": 505,
   "fn": 298,
   "tn": 2372
  },
  {
   "t": 0.61,
   "share": 0.2965,
   "prec": 0.5704,
   "rec": 0.6785,
   "f1": 0.6198,
   "tp": 648,
   "fp": 488,
   "fn": 307,
   "tn": 2389
  },
  {
   "t": 0.62,
   "share": 0.2868,
   "prec": 0.5732,
   "rec": 0.6597,
   "f1": 0.6134,
   "tp": 630,
   "fp": 469,
   "fn": 325,
   "tn": 2408
  },
  {
   "t": 0.63,
   "share": 0.2764,
   "prec": 0.576,
   "rec": 0.6387,
   "f1": 0.6058,
   "tp": 610,
   "fp": 449,
   "fn": 345,
   "tn": 2428
  },
  {
   "t": 0.64,
   "share": 0.2667,
   "prec": 0.5812,
   "rec": 0.622,
   "f1": 0.6009,
   "tp": 594,
   "fp": 428,
   "fn": 361,
   "tn": 2449
  },
  {
   "t": 0.65,
   "share": 0.2612,
   "prec": 0.5844,
   "rec": 0.6126,
   "f1": 0.5982,
   "tp": 585,
   "fp": 416,
   "fn": 370,
   "tn": 2461
  },
  {
   "t": 0.66,
   "share": 0.2513,
   "prec": 0.5867,
   "rec": 0.5916,
   "f1": 0.5892,
   "tp": 565,
   "fp": 398,
   "fn": 390,
   "tn": 2479
  },
  {
   "t": 0.67,
   "share": 0.2437,
   "prec": 0.5824,
   "rec": 0.5696,
   "f1": 0.576,
   "tp": 544,
   "fp": 390,
   "fn": 411,
   "tn": 2487
  },
  {
   "t": 0.68,
   "share": 0.2323,
   "prec": 0.5921,
   "rec": 0.5518,
   "f1": 0.5713,
   "tp": 527,
   "fp": 363,
   "fn": 428,
   "tn": 2514
  },
  {
   "t": 0.69,
   "share": 0.2213,
   "prec": 0.5955,
   "rec": 0.5288,
   "f1": 0.5602,
   "tp": 505,
   "fp": 343,
   "fn": 450,
   "tn": 2534
  },
  {
   "t": 0.7,
   "share": 0.2111,
   "prec": 0.597,
   "rec": 0.5058,
   "f1": 0.5476,
   "tp": 483,
   "fp": 326,
   "fn": 472,
   "tn": 2551
  },
  {
   "t": 0.71,
   "share": 0.1989,
   "prec": 0.5945,
   "rec": 0.4743,
   "f1": 0.5277,
   "tp": 453,
   "fp": 309,
   "fn": 502,
   "tn": 2568
  },
  {
   "t": 0.72,
   "share": 0.1895,
   "prec": 0.5909,
   "rec": 0.4492,
   "f1": 0.5104,
   "tp": 429,
   "fp": 297,
   "fn": 526,
   "tn": 2580
  },
  {
   "t": 0.73,
   "share": 0.1764,
   "prec": 0.5976,
   "rec": 0.423,
   "f1": 0.4954,
   "tp": 404,
   "fp": 272,
   "fn": 551,
   "tn": 2605
  },
  {
   "t": 0.74,
   "share": 0.1657,
   "prec": 0.5984,
   "rec": 0.3979,
   "f1": 0.478,
   "tp": 380,
   "fp": 255,
   "fn": 575,
   "tn": 2622
  },
  {
   "t": 0.75,
   "share": 0.1514,
   "prec": 0.6052,
   "rec": 0.3675,
   "f1": 0.4573,
   "tp": 351,
   "fp": 229,
   "fn": 604,
   "tn": 2648
  },
  {
   "t": 0.76,
   "share": 0.1386,
   "prec": 0.6026,
   "rec": 0.3351,
   "f1": 0.4307,
   "tp": 320,
   "fp": 211,
   "fn": 635,
   "tn": 2666
  },
  {
   "t": 0.77,
   "share": 0.1224,
   "prec": 0.6077,
   "rec": 0.2984,
   "f1": 0.4003,
   "tp": 285,
   "fp": 184,
   "fn": 670,
   "tn": 2693
  },
  {
   "t": 0.78,
   "share": 0.1117,
   "prec": 0.6145,
   "rec": 0.2754,
   "f1": 0.3803,
   "tp": 263,
   "fp": 165,
   "fn": 692,
   "tn": 2712
  },
  {
   "t": 0.79,
   "share": 0.101,
   "prec": 0.6124,
   "rec": 0.2482,
   "f1": 0.3532,
   "tp": 237,
   "fp": 150,
   "fn": 718,
   "tn": 2727
  },
  {
   "t": 0.8,
   "share": 0.0937,
   "prec": 0.6267,
   "rec": 0.2356,
   "f1": 0.3425,
   "tp": 225,
   "fp": 134,
   "fn": 730,
   "tn": 2743
  },
  {
   "t": 0.81,
   "share": 0.0859,
   "prec": 0.6292,
   "rec": 0.2168,
   "f1": 0.3224,
   "tp": 207,
   "fp": 122,
   "fn": 748,
   "tn": 2755
  },
  {
   "t": 0.82,
   "share": 0.0775,
   "prec": 0.6128,
   "rec": 0.1906,
   "f1": 0.2907,
   "tp": 182,
   "fp": 115,
   "fn": 773,
   "tn": 2762
  },
  {
   "t": 0.83,
   "share": 0.0715,
   "prec": 0.6168,
   "rec": 0.177,
   "f1": 0.275,
   "tp": 169,
   "fp": 105,
   "fn": 786,
   "tn": 2772
  },
  {
   "t": 0.84,
   "share": 0.0647,
   "prec": 0.6129,
   "rec": 0.1592,
   "f1": 0.2527,
   "tp": 152,
   "fp": 96,
   "fn": 803,
   "tn": 2781
  },
  {
   "t": 0.85,
   "share": 0.0618,
   "prec": 0.6076,
   "rec": 0.1508,
   "f1": 0.2416,
   "tp": 144,
   "fp": 93,
   "fn": 811,
   "tn": 2784
  },
  {
   "t": 0.86,
   "share": 0.0579,
   "prec": 0.5991,
   "rec": 0.1393,
   "f1": 0.226,
   "tp": 133,
   "fp": 89,
   "fn": 822,
   "tn": 2788
  },
  {
   "t": 0.87,
   "share": 0.0525,
   "prec": 0.597,
   "rec": 0.1257,
   "f1": 0.2076,
   "tp": 120,
   "fp": 81,
   "fn": 835,
   "tn": 2796
  },
  {
   "t": 0.88,
   "share": 0.0462,
   "prec": 0.6158,
   "rec": 0.1141,
   "f1": 0.1926,
   "tp": 109,
   "fp": 68,
   "fn": 846,
   "tn": 2809
  },
  {
   "t": 0.89,
   "share": 0.0415,
   "prec": 0.6164,
   "rec": 0.1026,
   "f1": 0.1759,
   "tp": 98,
   "fp": 61,
   "fn": 857,
   "tn": 2816
  },
  {
   "t": 0.9,
   "share": 0.0371,
   "prec": 0.6056,
   "rec": 0.0901,
   "f1": 0.1568,
   "tp": 86,
   "fp": 56,
   "fn": 869,
   "tn": 2821
  }
 ],
 "hist": {
  "bins": [
   0.0,
   0.025,
   0.05,
   0.075,
   0.1,
   0.125,
   0.15,
   0.175,
   0.2,
   0.225,
   0.25,
   0.275,
   0.3,
   0.325,
   0.35,
   0.375,
   0.4,
   0.425,
   0.45,
   0.475,
   0.5,
   0.525,
   0.55,
   0.575,
   0.6,
   0.625,
   0.65,
   0.675,
   0.7,
   0.725,
   0.75,
   0.775,
   0.8,
   0.825,
   0.85,
   0.875,
   0.9,
   0.925,
   0.95,
   0.975,
   1.0
  ],
  "h0": [
   0,
   3,
   17,
   44,
   55,
   105,
   179,
   162,
   166,
   189,
   207,
   175,
   165,
   158,
   135,
   113,
   89,
   82,
   91,
   62,
   41,
   46,
   35,
   53,
   50,
   39,
   40,
   50,
   42,
   55,
   54,
   41,
   27,
   14,
   18,
   19,
   18,
   29,
   9,
   0
  ],
  "h1": [
   0,
   0,
   2,
   5,
   7,
   10,
   9,
   7,
   11,
   15,
   11,
   12,
   18,
   10,
   18,
   13,
   15,
   9,
   25,
   10,
   11,
   28,
   25,
   27,
   35,
   37,
   48,
   54,
   67,
   65,
   79,
   47,
   50,
   31,
   28,
   30,
   30,
   37,
   19,
   0
  ]
 },
 "importance": [
  {
   "f": "city_development_index",
   "v": 0.0975,
   "s": 0.003
  },
  {
   "f": "company_type",
   "v": 0.0503,
   "s": 0.0035
  },
  {
   "f": "city",
   "v": 0.0475,
   "s": 0.0043
  },
  {
   "f": "major_discipline",
   "v": 0.0167,
   "s": 0.002
  },
  {
   "f": "company_size",
   "v": 0.0104,
   "s": 0.002
  },
  {
   "f": "experience_num",
   "v": 0.0043,
   "s": 0.0006
  },
  {
   "f": "enrolled_university",
   "v": 0.0036,
   "s": 0.0011
  },
  {
   "f": "relevent_experience",
   "v": 0.0035,
   "s": 0.0011
  },
  {
   "f": "education_level",
   "v": 0.0009,
   "s": 0.0003
  },
  {
   "f": "training_hours",
   "v": 0.0008,
   "s": 0.0002
  },
  {
   "f": "last_new_job_num",
   "v": 0.0008,
   "s": 0.0006
  },
  {
   "f": "gender",
   "v": 0.0006,
   "s": 0.0002
  }
 ],
 "cm05": [
  [
   2197,
   680
  ],
  [
   207,
   748
  ]
 ],
 "scored_new": {
  "n": 2129,
  "flagged05": 0.367
 }
};
