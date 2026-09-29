from pathlib import Path
import pickle
import shutil

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.base import clone
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "outputs"
OUTPUT_CSV = OUTPUT_DIR / "output_prediction.csv"
FALLBACK_DATASET = Path(r"C:\Users\Aaryan\Documents\Datasets\aug_train.csv")
TARGET_LABELS = {0: "No job change", 1: "Looking for job change"}
TARGET_NAMES = list(TARGET_LABELS.values())
TARGET_COLORS = ["#4C72B0", "#DD8452"]
TARGET_PALETTE = dict(zip(TARGET_NAMES, TARGET_COLORS))


def resolve_dataset_path() -> Path:
    archive_path = ROOT / "archive" / "aug_train.csv"
    if archive_path.exists():
        return archive_path
    local_path = ROOT / "data" / "aug_train.csv"
    if not local_path.exists() and FALLBACK_DATASET.exists():
        local_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(FALLBACK_DATASET, local_path)
    if local_path.exists():
        return local_path
    raise FileNotFoundError(
        f"Training dataset not found. Expected {local_path} or {FALLBACK_DATASET}."
    )


def prepare_features(df: pd.DataFrame):
    X = df.copy()
    if "target" in X.columns:
        y = X["target"].astype(int).copy()
        X = X.drop(columns=["target"])
    else:
        raise ValueError("Expected a target column in the training dataset.")

    ids = (
        X["enrollee_id"].copy()
        if "enrollee_id" in X.columns
        else pd.Series(range(len(X)), name="enrollee_id")
    )
    if "enrollee_id" in X.columns:
        X = X.drop(columns=["enrollee_id"])

    experience_mapping = {"<1": 0.5, **{str(i): i for i in range(1, 21)}, ">20": 21}
    last_job_mapping = {"never": 0, "1": 1, "2": 2, "3": 3, "4": 4, ">4": 5}

    X["experience_num"] = X["experience"].map(experience_mapping)
    X["last_new_job_num"] = X["last_new_job"].map(last_job_mapping)
    X = X.drop(columns=["experience", "last_new_job"])
    return X, y, ids


def print_dataset_summary(df: pd.DataFrame):
    print("\n=== DATASET OVERVIEW ===")
    print(f"Rows: {df.shape[0]}")
    print(f"Columns: {df.shape[1]}")
    print(f"Duplicate rows: {df.duplicated().sum()}")
    print(f"Missing values total: {df.isna().sum().sum()}")
    print("\nColumn dtypes:")
    print(df.dtypes.to_string())
    print("\nTop missing-value columns:")
    missing = df.isna().sum().sort_values(ascending=False)
    missing = missing[missing > 0]
    if missing.empty:
        print("No missing values found.")
    else:
        print(missing.to_string())

    target_counts = df["target"].fillna(0).astype(int).value_counts().sort_index()
    print("\nTarget counts:")
    mapped = target_counts.rename(index=TARGET_LABELS)
    print(mapped.to_string())

    print("\nNumeric summary:")
    numeric_summary = df[["city_development_index", "training_hours"]].agg(
        ["count", "mean", "std", "min", "max"]
    )
    print(numeric_summary.to_string())
    print("\nTop categorical breakdowns:")
    for col in ["gender", "education_level", "relevent_experience", "enrolled_university"]:
        if col in df.columns:
            print(f"\n{col}:\n{df[col].value_counts(dropna=False).head(10).to_string()}")


def show_target_distribution(df: pd.DataFrame):
    counts = (
        df["target"]
        .map(TARGET_LABELS)
        .value_counts()
        .reindex(TARGET_NAMES, fill_value=0)
    )
    counts_df = counts.reset_index()
    counts_df.columns = ["label", "count"]
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.barplot(
        data=counts_df,
        x="label",
        y="count",
        hue="label",
        palette=TARGET_COLORS,
        legend=False,
        ax=ax,
    )
    ax.set_title("Churn target distribution")
    ax.set_xlabel("Target category")
    ax.set_ylabel("Number of candidates")
    ax.set_ylim(0, max(counts.values) * 1.2)
    ax.grid(axis="y", linestyle="--", alpha=0.3)
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def show_education_distribution(df: pd.DataFrame):
    order = ["Primary School", "High School", "Graduate", "Masters", "Phd", "Unknown"]
    chart_df = df.assign(churn_status=df["target"].map(TARGET_LABELS))
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.countplot(
        data=chart_df,
        x="education_level",
        order=order,
        hue="churn_status",
        ax=ax,
        palette=TARGET_COLORS,
        hue_order=TARGET_NAMES,
    )
    ax.set_title("Education level by churn status")
    ax.set_xlabel("Education level")
    ax.set_ylabel("Count")
    ax.legend(title="Churn status")
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def show_training_hours_distribution(df: pd.DataFrame):
    chart_df = df.assign(churn_status=df["target"].map(TARGET_LABELS))
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.histplot(
        data=chart_df,
        x="training_hours",
        hue="churn_status",
        bins=30,
        kde=True,
        element="step",
        alpha=0.6,
        palette=TARGET_COLORS,
        ax=ax,
    )
    ax.set_title("Training hours vs churn status")
    ax.set_xlabel("Training hours")
    ax.set_ylabel("Frequency")
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def show_city_index_distribution(df: pd.DataFrame):
    chart_df = df.assign(churn_status=df["target"].map(TARGET_LABELS))
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.boxplot(
        data=chart_df,
        x="churn_status",
        y="city_development_index",
        order=TARGET_NAMES,
        hue="churn_status",
        palette=TARGET_COLORS,
        legend=False,
        ax=ax,
    )
    ax.set_title("City development index by churn status")
    ax.set_xlabel("Churn status")
    ax.set_ylabel("City development index")
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def show_knn_comparison(df: pd.DataFrame, base_model):
    X, y, _ = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )
    X_train = X_train.reset_index(drop=True)
    X_test = X_test.reset_index(drop=True)
    y_train = y_train.reset_index(drop=True)
    y_test = y_test.reset_index(drop=True)

    pipeline = Pipeline(
        [
            ("preprocessor", clone(base_model.named_steps["preprocessor"])),
            ("model", KNeighborsClassifier(n_neighbors=15)),
        ]
    )
    pipeline.fit(X_train, y_train)

    predicted_labels = pipeline.predict(X_test).astype(int)
    plot_df = pd.DataFrame({
        "training_hours": X_test["training_hours"],
        "city_development_index": X_test["city_development_index"],
        "predicted_churn": pd.Series(predicted_labels).map(TARGET_LABELS),
    })

    fig, ax = plt.subplots(figsize=(9, 6))

    for label in TARGET_NAMES:
        subset = plot_df[plot_df["predicted_churn"] == label]
        ax.scatter(
            subset["training_hours"],
            subset["city_development_index"],
            c=TARGET_PALETTE[label],
            s=18,
            alpha=0.7,
            label=label,
        )

    ax.set_title("KNN churn clusters in training-hours vs city-development space")
    ax.set_xlabel("Training hours")
    ax.set_ylabel("City development index")
    ax.legend(title="Predicted churn class")
    ax.grid(True, linestyle="--", alpha=0.25)
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def print_model_parameters(model):
    print("\n=== MODEL PARAMETERS ===")
    algorithms = [
        "Logistic Regression",
        "K-Nearest Neighbors (KNN)",
        "Random Forest",
        "Decision Tree",
        "Dummy baseline",
    ]
    print(f"Algorithms evaluated ({len(algorithms)}): {', '.join(algorithms)}")
    model_step = model.named_steps["model"] if "model" in model.named_steps else model
    params = model_step.get_params()
    print(f"Selected model: {type(model_step).__name__}")
    print(f"Number of model parameters: {len(params)}")
    important_params = {
        key: params[key]
        for key in ["C", "solver", "penalty", "class_weight", "max_iter", "n_neighbors", "n_estimators"]
        if key in params and params[key] is not None
    }
    if important_params:
        print(f"Selected parameter values: {important_params}")


def print_feature_contributions():
    importance_path = OUTPUT_DIR / "feature_importance.csv"
    print("\n=== TOP CONTRIBUTING FEATURES ===")
    if not importance_path.exists():
        print("Feature importance file not found. Run train_model.py first.")
        return

    importance = pd.read_csv(importance_path).head(10)
    for rank, row in enumerate(importance.itertuples(index=False), start=1):
        print(f"{rank}. {row.Feature}: {row.Importance_Mean:.6f} (+/-{row.Importance_Std:.6f})")


def add_model_metrics_summary(df: pd.DataFrame, model):
    X, y, _ = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )
    X_train = X_train.reset_index(drop=True)
    X_test = X_test.reset_index(drop=True)
    y_train = y_train.reset_index(drop=True)
    y_test = y_test.reset_index(drop=True)

    prob = model.predict_proba(X_test)[:, 1]
    pred = (prob >= 0.5).astype(int)
    accuracy = accuracy_score(y_test, pred)
    precision = precision_score(y_test, pred, zero_division=0)
    recall = recall_score(y_test, pred, zero_division=0)
    f1 = f1_score(y_test, pred, zero_division=0)
    roc = roc_auc_score(y_test, prob)

    tp = ((pred == 1) & (y_test == 1)).sum()
    tn = ((pred == 0) & (y_test == 0)).sum()
    fp = ((pred == 1) & (y_test == 0)).sum()
    fn = ((pred == 0) & (y_test == 1)).sum()
    correct = (pred == y_test).sum()
    wrong = (pred != y_test).sum()

    print("\n=== MODEL PERFORMANCE SUMMARY ===")
    print(f"Correct predictions: {correct}")
    print(f"Wrong predictions: {wrong}")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 score: {f1:.4f}")
    print(f"ROC-AUC: {roc:.4f}")
    print(f"True positives: {tp}")
    print(f"True negatives: {tn}")
    print(f"False positives: {fp}")
    print(f"False negatives: {fn}")

    if len(prob) > 1:
        z_score = np.abs((prob - prob.mean()) / prob.std(ddof=0)).mean()
        print(f"Average z-score magnitude on probability predictions: {z_score:.4f}")


def show_city_development_plot(df: pd.DataFrame):
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.histplot(data=df, x="city_development_index", bins=25, kde=True, color="#4C72B0", ax=ax)
    ax.set_title("City development index distribution")
    ax.set_xlabel("City development index")
    ax.set_ylabel("Count")
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def show_gender_distribution(df: pd.DataFrame):
    chart_df = df.assign(churn_status=df["target"].map(TARGET_LABELS))
    chart_df["gender"] = chart_df["gender"].fillna("Unknown")
    fig, ax = plt.subplots(figsize=(7, 5))
    sns.countplot(
        data=chart_df,
        x="gender",
        hue="churn_status",
        palette=TARGET_COLORS,
        ax=ax,
    )
    ax.set_title("Gender distribution by churn status")
    ax.set_xlabel("Gender")
    ax.set_ylabel("Count")
    ax.legend(title="Churn status")
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def show_experience_distribution(df: pd.DataFrame):
    chart_df = df.assign(churn_status=df["target"].map(TARGET_LABELS))
    chart_df["experience"] = chart_df["experience"].fillna("Unknown")
    order = [
        "<1", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
        "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", ">20",
    ]
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.countplot(
        data=chart_df,
        x="experience",
        order=order,
        hue="churn_status",
        palette=TARGET_COLORS,
        ax=ax,
    )
    ax.set_title("Experience distribution by churn status")
    ax.set_xlabel("Experience (years)")
    ax.set_ylabel("Count")
    ax.legend(title="Churn status")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
    plt.close(fig)


def print_inferences(df: pd.DataFrame, model):
    print("\n=== DATA INFERENCES ===")
    churn_rate = df["target"].mean()
    print(f"Overall job-change rate: {churn_rate:.2%}")

    city_counts = df.groupby("city")["target"].count()
    eligible_cities = city_counts[city_counts >= 50].index
    city_summary = (
        df[df["city"].isin(eligible_cities)]
        .groupby("city")["target"].mean()
        .sort_values(ascending=False)
        .head(5)
    )
    print("\nCities with the highest churn tendency (min. 50 candidates):")
    for city, rate in city_summary.items():
        print(f"{city}: {rate:.2%} ({city_counts[city]} candidates)")

    education_summary = df.groupby("education_level")["target"].mean().sort_values(ascending=False)
    print("\nChurn rate by education level:")
    education_counts = df.groupby("education_level")["target"].count()
    for education, rate in education_summary.items():
        print(f"{education}: {rate:.2%} ({education_counts[education]} candidates)")

    gender_summary = (
        df.groupby("gender", dropna=False)["target"]
        .agg(["mean", "count"])
        .sort_values("mean", ascending=False)
    )
    print("\nChurn rate by gender:")
    for gender, row in gender_summary.iterrows():
        label = gender if pd.notna(gender) else "Unknown"
        print(f"{label}: {row['mean']:.2%} ({int(row['count'])} candidates)")

    experience_summary = (
        df.groupby("experience", dropna=False)["target"]
        .agg(["mean", "count"])
        .sort_values("mean", ascending=False)
        .head(10)
    )
    print("\nHighest churn experience groups:")
    for experience, row in experience_summary.iterrows():
        label = experience if pd.notna(experience) else "Unknown"
        print(f"{label}: {row['mean']:.2%} ({int(row['count'])} candidates)")

    print("\nBusiness interpretation:")
    top_city = city_summary.index[0]
    print(
        f"- The highest city-level churn rate is {city_summary.iloc[0]:.2%} in "
        f"{top_city}, based on {city_counts[top_city]} candidates."
    )
    print(
        f"- The highest education-group churn rate is {education_summary.iloc[0]:.2%} "
        f"for {education_summary.index[0]} ({education_counts[education_summary.index[0]]} candidates)."
    )
    print(
        f"- The highest experience-group churn rate is "
        f"{experience_summary.iloc[0]['mean']:.2%} for {experience_summary.index[0]} "
        f"({int(experience_summary.iloc[0]['count'])} candidates)."
    )
    print(
        "- The model is best used as a prioritization tool for outreach, not as a "
        "legal or employment suitability measure."
    )

    if hasattr(model, "predict_proba"):
        print("\nModel interpretation:")
        print("- The trained model separates candidates by a risk score rather than hard rule-based labels.")
        print(
            "- A candidate with a higher probability is more likely to be in the "
            "'Looking for job change' group."
        )
        print(
            "- The final score should guide recruiter focus, interview outreach, "
            "and campaign segmentation."
        )


def generate_combined_predictions():
    data_path = resolve_dataset_path()
    df = pd.read_csv(data_path)
    print_dataset_summary(df)

    show_target_distribution(df)
    show_education_distribution(df)
    show_training_hours_distribution(df)
    show_city_index_distribution(df)
    show_city_development_plot(df)
    show_gender_distribution(df)
    show_experience_distribution(df)
    model_path = ROOT / "artifacts" / "final_model.pkl"
    with open(model_path, "rb") as fh:
        model = pickle.load(fh)

    print_model_parameters(model)
    print_feature_contributions()
    add_model_metrics_summary(df, model)
    print_inferences(df, model)
    show_knn_comparison(df, model)

    X_full, y_full, ids_full = prepare_features(df)
    X_train, X_test, y_train, y_test, ids_train, ids_test = train_test_split(
        X_full,
        y_full,
        ids_full,
        test_size=0.20,
        random_state=42,
        stratify=y_full,
    )

    def build_prediction_frame(X, y, ids, split_name):
        probabilities = model.predict_proba(X)[:, 1]
        predicted_labels = (probabilities >= 0.5).astype(int)
        status = ["correct" if pred == actual else "wrong" for pred, actual in zip(predicted_labels, y)]
        frame = pd.DataFrame(
            {
                "split": split_name,
                "enrollee_id": ids.values,
                "actual_target": y.astype(int).values,
                "predicted_probability_job_change": probabilities,
                "predicted_class_0_5_threshold": predicted_labels,
                "prediction_status": status,
                "is_wrong": [value == "wrong" for value in status],
            }
        )
        return frame

    train_report = build_prediction_frame(X_train, y_train, ids_train, "train")
    test_report = build_prediction_frame(X_test, y_test, ids_test, "test")
    combined = pd.concat([train_report, test_report], ignore_index=True, axis=0)
    combined = combined.sort_values(["split", "enrollee_id"], ascending=[True, True]).reset_index(drop=True)
    combined.to_csv(OUTPUT_CSV, index=False)

    wrong_rows = combined[combined["is_wrong"] == True]
    wrong_file = OUTPUT_DIR / "wrong_predictions.csv"
    wrong_rows.to_csv(wrong_file, index=False)

    print(f"\nSaved combined prediction report to {OUTPUT_CSV}")
    print(f"Saved wrong predictions to {wrong_file}")
    print(f"Total wrong predictions: {len(wrong_rows)}")


if __name__ == "__main__":
    generate_combined_predictions()
