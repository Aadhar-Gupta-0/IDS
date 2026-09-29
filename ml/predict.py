from pathlib import Path
import argparse
import pandas as pd
from inference import HRJobChangePredictor

def main():
    parser = argparse.ArgumentParser(description='Predict job-change probability with the enhanced deployable model.')
    parser.add_argument('input_csv', type=Path)
    parser.add_argument('output_csv', type=Path)
    args = parser.parse_args()
    raw = pd.read_csv(args.input_csv)
    predictor = HRJobChangePredictor()
    out = predictor.predict_records(raw)
    args.output_csv.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(args.output_csv, index=False)
    print(f'Saved {len(out):,} predictions to {args.output_csv}')

if __name__ == '__main__':
    main()
