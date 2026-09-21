from pathlib import Path
import pickle
import warnings

warnings.filterwarnings("ignore")

import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.inspection import permutation_importance

RANDOM_STATE = 42
ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "aug_train.csv"
OUTPUT_DIR = ROOT / "outputs"
ARTIFACT_DIR = ROOT / "artifacts"
OUTPUT_DIR.mkdir(exist_ok=True)
ARTIFACT_DIR.mkdir(exist_ok=True)


def prepare_raw_features(df: pd.DataFrame):
    X = df.drop(columns=["target"]).copy()
    y = df["target"].astype(int).copy()
    X = X.drop(columns=["enrollee_id"])

    experience_mapping = {"<1": 0.5, **{str(i): i for i in range(1, 21)}, ">20": 21}
    last_job_mapping = {"never": 0, "1": 1, "2": 2, "3": 3, "4": 4, ">4": 5}

    X["experience_num"] = X["experience"].map(experience_mapping)
    X["last_new_job_num"] = X["last_new_job"].map(last_job_mapping)
    X = X.drop(columns=["experience", "last_new_job"])
    return X, y


def build_preprocessor():
    nominal_features = [
        "city", "gender", "relevent_experience", "enrolled_university",
        "major_discipline", "company_type"
    ]
    ordinal_features = ["education_level", "company_size"]
    numeric_features = [
        "city_development_index", "training_hours",
        "experience_num", "last_new_job_num"
    ]

    education_categories = [
        "Unknown", "Primary School", "High School", "Graduate", "Masters", "Phd"
    ]
    company_size_categories = [
        "Unknown", "<10", "10/49", "50-99", "100-500", "500-999",
        "1000-4999", "5000-9999", "10000+"
    ]

    nominal_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    ordinal_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("ordinal", OrdinalEncoder(
            categories=[education_categories, company_size_categories],
            handle_unknown="use_encoded_value",
            unknown_value=-1
        ))
    ])

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    return ColumnTransformer([
        ("nominal", nominal_pipeline, nominal_features),
        ("ordinal", ordinal_pipeline, ordinal_features),
        ("numeric", numeric_pipeline, numeric_features)
    ], remainder="drop")


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Missing {DATA_PATH}. Download aug_train.csv and place it in data/."
        )

    df = pd.read_csv(DATA_PATH)
    X, y = prepare_raw_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    preprocessor = build_preprocessor()

    models = {
        "Dummy": DummyClassifier(strategy="most_frequent"),
        "Logistic Regression": LogisticRegression(
            max_iter=2000, class_weight="balanced", random_state=RANDOM_STATE
        ),
        "Decision Tree": DecisionTreeClassifier(
            class_weight="balanced", random_state=RANDOM_STATE
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, class_weight="balanced",
            random_state=RANDOM_STATE, n_jobs=-1
        ),
        "KNN": KNeighborsClassifier(n_neighbors=15)
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    scoring = {"f1": "f1", "roc_auc": "roc_auc"}

    pipelines = {}
    rows = []

    for name, estimator in models.items():
        pipe = Pipeline([("preprocessor", preprocessor), ("model", estimator)])
        pipelines[name] = pipe

        scores = cross_validate(
            pipe, X_train, y_train, cv=cv, scoring=scoring, n_jobs=-1
        )

        rows.append({
            "Model": name,
            "Mean_F1": scores["test_f1"].mean(),
            "Std_F1": scores["test_f1"].std(),
            "Mean_ROC_AUC": scores["test_roc_auc"].mean(),
            "Std_ROC_AUC": scores["test_roc_auc"].std()
        })

    cv_df = pd.DataFrame(rows).sort_values("Mean_ROC_AUC", ascending=False)
    cv_df.to_csv(OUTPUT_DIR / "cv_model_comparison.csv", index=False)
    print(cv_df.to_string(index=False))

    best_name = cv_df.iloc[0]["Model"]
    if best_name == "Dummy":
        raise RuntimeError("Dummy baseline ranked first; review the modelling setup.")

    grids = {
        "Logistic Regression": {
            "model__C": [0.01, 0.1, 1, 10],
            "model__solver": ["liblinear"],
            "model__penalty": ["l1", "l2"]
        },
        "Decision Tree": {
            "model__max_depth": [4, 6, 8, 12, None],
            "model__min_samples_split": [2, 10, 30],
            "model__min_samples_leaf": [1, 5, 15]
        },
        "Random Forest": {
            "model__n_estimators": [200, 400],
            "model__max_depth": [6, 10, None],
            "model__min_samples_leaf": [1, 5, 10],
            "model__max_features": ["sqrt", 0.5]
        },
        "KNN": {
            "model__n_neighbors": [7, 15, 25, 35],
            "model__weights": ["uniform", "distance"],
            "model__p": [1, 2]
        }
    }

    search = GridSearchCV(
        pipelines[best_name],
        grids[best_name],
        scoring={"f1": "f1", "roc_auc": "roc_auc"},
        refit="roc_auc",
        cv=cv,
        n_jobs=-1
    )
    search.fit(X_train, y_train)
    final_model = search.best_estimator_

    y_pred = final_model.predict(X_test)
    y_prob = final_model.predict_proba(X_test)[:, 1]

    test_metrics = pd.DataFrame({
        "Metric": ["Accuracy", "Precision", "Recall", "F1", "ROC-AUC"],
        "Score": [
            accuracy_score(y_test, y_pred),
            precision_score(y_test, y_pred, zero_division=0),
            recall_score(y_test, y_pred, zero_division=0),
            f1_score(y_test, y_pred, zero_division=0),
            roc_auc_score(y_test, y_prob)
        ]
    })
    test_metrics.to_csv(OUTPUT_DIR / "test_metrics.csv", index=False)

    perm = permutation_importance(
        final_model, X_test, y_test,
        scoring="roc_auc", n_repeats=10,
        random_state=RANDOM_STATE, n_jobs=-1
    )

    importance_df = pd.DataFrame({
        "Feature": X_test.columns,
        "Importance_Mean": perm.importances_mean,
        "Importance_Std": perm.importances_std
    }).sort_values("Importance_Mean", ascending=False)
    importance_df.to_csv(OUTPUT_DIR / "feature_importance.csv", index=False)

    with open(ARTIFACT_DIR / "final_model.pkl", "wb") as f:
        pickle.dump(final_model, f)

    print("\nSelected model:", best_name)
    print("Best parameters:", search.best_params_)
    print("\nTest metrics:")
    print(test_metrics.to_string(index=False))
    print("\nSaved model:", ARTIFACT_DIR / "final_model.pkl")


if __name__ == "__main__":
    main()
