from pathlib import Path
import argparse
import pickle
import pandas as pd


def prepare_features(df: pd.DataFrame):
    X = df.copy()

    if "target" in X.columns:
        X = X.drop(columns=["target"])

    if "enrollee_id" in X.columns:
        enrollee_id = X["enrollee_id"].copy()
        X = X.drop(columns=["enrollee_id"])
    else:
        enrollee_id = pd.Series(range(len(X)), name="enrollee_id")

    experience_mapping = {"<1": 0.5, **{str(i): i for i in range(1, 21)}, ">20": 21}
    last_job_mapping = {"never": 0, "1": 1, "2": 2, "3": 3, "4": 4, ">4": 5}

    X["experience_num"] = X["experience"].map(experience_mapping)
    X["last_new_job_num"] = X["last_new_job"].map(last_job_mapping)
    X = X.drop(columns=["experience", "last_new_job"])

    return X, enrollee_id


def main():
    parser = argparse.ArgumentParser(description="Predict job-change probability.")
    parser.add_argument("input_csv", type=Path)
    parser.add_argument("output_csv", type=Path)
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    model_path = root / "artifacts" / "final_model.pkl"

    if not model_path.exists():
        raise FileNotFoundError("Trained model not found. Run: python src/train_model.py")

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    raw = pd.read_csv(args.input_csv)
    X, ids = prepare_features(raw)

    prob = model.predict_proba(X)[:, 1]
    pred = (prob >= 0.50).astype(int)

    out = pd.DataFrame({
        "enrollee_id": ids.values,
        "predicted_probability_job_change": prob,
        "predicted_class_0_5_threshold": pred
    })

    args.output_csv.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(args.output_csv, index=False)
    print(f"Saved predictions to {args.output_csv}")


if __name__ == "__main__":
    main()
