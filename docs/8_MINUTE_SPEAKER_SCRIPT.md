# 8-Minute Speaker Script — Job-Change Radar

Target runtime: **7:25–7:40**, leaving ~20–35 seconds of buffer.

## Scene 1 — Hook (0:00–0:35)
“Imagine you are a recruiter with 19,158 trained data-science candidates and limited calling capacity. Only about one in four reports looking for a job change. The question is not whether we can call everyone — it is who should we call first? We built Job-Change Radar to rank candidates by job-change intent.”

**Action:** Start on Scene 1. Pause for the 100-dot visual, then press →.

## Scene 2 — Business question (0:35–1:10)
“This is a binary classification problem. Target 1 means the candidate reports looking for a job change. Importantly, this is not employee attrition — these are training-program candidates. The output is a prioritisation score for recruiter outreach, not an automatic hiring or rejection decision.”

**Action:** Point briefly to the 25% base rate and the ‘rank, not verdict’ card. Press →.

## Scene 3 — Data understanding (1:10–1:55)
“We have 19,158 labelled candidates. The positive class is 24.9%, so accuracy alone can be misleading. More than half the rows have at least one missing field, so deleting incomplete rows would remove a large and systematically different part of the sample. The strongest visible pattern is geographic: low city-development-index groups have much higher observed job-change rates than highly developed groups. That is correlation, not causation.”

**Action:** Emphasise 24.9%, 53%, and 58%→17%. Press →.

## Scene 4 — Data preparation (1:55–2:35)
“We preserved missingness as information, engineered numeric versions of experience and job-change recency, added missing-count and employer-information flags, and kept categorical variables for the advanced model. Most importantly, we locked 20% of the labelled data as the final test set. Model selection and threshold choice used only the development data with 5-fold cross-validation, so the final test remained untouched.”

**Action:** Trace the pipeline left-to-right. Press →.

## Scene 5 — Model battle (2:35–3:45)
“For the course requirement we compared a dummy baseline with Logistic Regression, Decision Tree, Random Forest and KNN. Logistic Regression was the strongest conventional benchmark at about 0.79 ROC-AUC. For deployment, we then added CatBoost because the table is dominated by categorical variables, missing values and nonlinear interactions. Its 5-fold out-of-fold ROC-AUC was about 0.806. We averaged three independently seeded CatBoost models rather than selecting one lucky run.”

“CatBoost is an extension — it does not replace the taught-model comparison.”

**Action:** Pause on Logistic Regression, then point to CatBoost. Press →.

## Scene 6 — Live model (3:45–4:50)
“Now we can run an actual candidate through the deployed model.”

**Action:** Click **High-intent example**. Wait for the real API result.

“The browser sends this profile to a FastAPI endpoint. Three CatBoost models score it and we average their probabilities. This candidate receives a relatively high outreach score. These cues are associations in the profile — they are not causal explanations.”

**Optional 10-second contrast:** Click **Low-intent example** and say, “Changing the profile produces a very different score, so this is live inference rather than a fixed animation.”

Press →.

## Scene 7 — Final evaluation (4:50–5:50)
“On the same locked test set, the original Logistic Regression reaches 0.7923 ROC-AUC. The deployment ensemble reaches 0.8036. At thresholds selected only from validation data, accuracy improves from 79.12% to 80.19%, and F1 from 0.591 to 0.631.”

“We do not lead with accuracy because a majority-class model already gets about 75%. ROC-AUC tells us how well the model ranks movers above non-movers across thresholds. If the business wants more recall, our validation-selected F1 threshold raises recall to 73.6%.”

Press →.

## Scene 8 — Business use + limitations (5:50–6:55)
“The model’s job is to prioritise outreach. Recruiters can sort a large candidate pool and choose a threshold based on calling capacity. A lower threshold catches more potential movers; a higher threshold reduces unnecessary calls.”

“Three limitations matter. First, this is one historical training-program sample, and stated intent is not guaranteed future behaviour. Second, location can proxy socioeconomic conditions, so subgroup error and fairness need an explicit audit before real use. Third, an AUC around 0.80 is useful ranking signal, not certainty. Better longitudinal and behavioural data is more likely to create the next major gain than endless tuning.”

Press →.

## Scene 9 — Closing (6:55–7:30)
“Our project started with a machine-learning question, but the business question is simpler: who should a recruiter talk to first? We moved from 19,158 candidates, through leakage-safe validation and model comparison, to a deployable ranking system that can run live. Job-Change Radar helps prioritise outreach while keeping the final decision with people.”

“Thank you.”

Stop. Do not fill the remaining time unless the faculty asks.

## Suggested 4-person handoff
- **Speaker 1:** Scenes 1–3 (0:00–1:55)
- **Speaker 2:** Scenes 4–5 (1:55–3:45)
- **Speaker 3:** Scenes 6–7 (3:45–5:50)
- **Speaker 4:** Scenes 8–9 (5:50–7:30)

Every member should still understand the complete workflow for Q&A.
