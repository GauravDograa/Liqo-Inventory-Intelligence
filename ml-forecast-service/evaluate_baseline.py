from __future__ import annotations

import json
from pathlib import Path

from app.baseline import predict_units_from_row
from app.challenger import predict_units_from_row as predict_challenger_units
from app.lag_trend import predict_units_from_row as predict_lag_trend_units
from train_baseline import train_model
from train_challenger import train_model as train_challenger_model
from train_lag_trend import train_model as train_lag_trend_model


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "training_dataset.json"
REPORT_PATH = ROOT / "artifacts" / "evaluation_report.json"
SELECTION_PATH = ROOT / "artifacts" / "model_selection.json"
HISTORY_PATH = ROOT / "artifacts" / "model_history.json"


def main() -> None:
    dataset = json.loads(DATASET_PATH.read_text())
    rows = sorted(
        dataset.get("rows", []),
        key=lambda row: row["anchor_date"],
    )

    if len(rows) < 10:
      raise ValueError("Need at least 10 rows for train/test evaluation")

    split_index = max(1, int(len(rows) * 0.8))
    train_rows = rows[:split_index]
    test_rows = rows[split_index:]

    if not test_rows:
        raise ValueError("Test split is empty")

    trained_model = train_model(
        {
            "rows": train_rows,
            "metadata": dataset.get("metadata", {}),
        }
    )
    challenger_model = train_challenger_model(
        {
            "rows": train_rows,
            "metadata": dataset.get("metadata", {}),
        }
    )
    lag_trend_model = train_lag_trend_model(
        {
            "rows": train_rows,
            "metadata": dataset.get("metadata", {}),
        }
    )

    baseline_metrics = evaluate_rows(test_rows, None, "baseline")
    trained_metrics = evaluate_rows(test_rows, trained_model, "baseline")
    challenger_metrics = evaluate_rows(
        test_rows,
        challenger_model,
        "challenger",
    )
    lag_trend_metrics = evaluate_rows(
        test_rows,
        lag_trend_model,
        "lag_trend",
    )

    report = {
        "dataset": {
            "total_rows": len(rows),
            "train_rows": len(train_rows),
            "test_rows": len(test_rows),
            "history_window_days": dataset.get("metadata", {}).get(
                "historyWindowDays"
            ),
            "horizon_days": dataset.get("metadata", {}).get("horizonDays"),
        },
        "baseline_without_training": baseline_metrics,
        "trained_baseline": trained_metrics,
        "trained_challenger": challenger_metrics,
        "trained_lag_trend": lag_trend_metrics,
        "time_based_validation": walk_forward_validate(rows),
        "model_summary": trained_model,
        "challenger_summary": challenger_model,
        "lag_trend_summary": lag_trend_model,
        "winner": choose_winner(
            baseline_metrics,
            trained_metrics,
            challenger_metrics,
            lag_trend_metrics,
        ),
        "improvement": {
            "mae_delta": round(
                baseline_metrics["mae"] - trained_metrics["mae"], 4
            ),
            "challenger_mae_delta": round(
                baseline_metrics["mae"] - challenger_metrics["mae"], 4
            ),
            "lag_trend_mae_delta": round(
                baseline_metrics["mae"] - lag_trend_metrics["mae"], 4
            ),
            "mape_delta": round(
                baseline_metrics["mape"] - trained_metrics["mape"], 4
            ),
            "challenger_mape_delta": round(
                baseline_metrics["mape"] - challenger_metrics["mape"], 4
            ),
            "lag_trend_mape_delta": round(
                baseline_metrics["mape"] - lag_trend_metrics["mape"], 4
            ),
            "rmse_delta": round(
                baseline_metrics["rmse"] - trained_metrics["rmse"], 4
            ),
            "challenger_rmse_delta": round(
                baseline_metrics["rmse"] - challenger_metrics["rmse"], 4
            ),
            "lag_trend_rmse_delta": round(
                baseline_metrics["rmse"] - lag_trend_metrics["rmse"], 4
            ),
        },
        "sample_predictions": build_sample_predictions(
            test_rows,
            trained_model,
            challenger_model,
            lag_trend_model,
        ),
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2))
    selection = build_model_selection(report)
    SELECTION_PATH.write_text(json.dumps(selection, indent=2))
    HISTORY_PATH.write_text(
        json.dumps(
            append_history_entry(load_history(), report, selection),
            indent=2,
        )
    )
    print(json.dumps(report, indent=2))


def evaluate_rows(
    rows: list[dict],
    trained_model: dict | None,
    model_type: str,
) -> dict:
    errors: list[float] = []
    squared_errors: list[float] = []
    absolute_percentage_errors: list[float] = []

    for row in rows:
        predicted = predict_for_model(row, trained_model, model_type)
        actual = float(row["target_units_sold_next_horizon"])
        error = predicted - actual

        errors.append(abs(error))
        squared_errors.append(error * error)
        absolute_percentage_errors.append(abs(error) / max(actual, 1.0))

    mae = sum(errors) / len(errors)
    mse = sum(squared_errors) / len(squared_errors)
    rmse = mse ** 0.5
    mape = sum(absolute_percentage_errors) / len(absolute_percentage_errors)

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "mape": round(mape, 4),
    }


def build_sample_predictions(
    rows: list[dict],
    trained_model: dict,
    challenger_model: dict,
    lag_trend_model: dict,
) -> list[dict]:
    samples = []

    for row in rows[:5]:
        baseline_prediction = predict_for_model(row, None, "baseline")
        trained_prediction = predict_for_model(
            row, trained_model, "baseline"
        )
        challenger_prediction = predict_for_model(
            row, challenger_model, "challenger"
        )
        lag_trend_prediction = predict_for_model(
            row, lag_trend_model, "lag_trend"
        )
        samples.append(
            {
                "anchor_date": row["anchor_date"],
                "store_id": row["store_id"],
                "sku_id": row["sku_id"],
                "category": row["category"],
                "actual_units": row["target_units_sold_next_horizon"],
                "baseline_prediction": round(baseline_prediction, 2),
                "trained_prediction": round(trained_prediction, 2),
                "challenger_prediction": round(challenger_prediction, 2),
                "lag_trend_prediction": round(lag_trend_prediction, 2),
            }
        )

    return samples


def walk_forward_validate(rows: list[dict]) -> dict:
    minimum_train_rows = max(12, int(len(rows) * 0.5))
    fold_size = max(2, int(len(rows) * 0.15))
    folds = []

    for split_index in range(minimum_train_rows, len(rows), fold_size):
        train_rows = rows[:split_index]
        test_rows = rows[split_index : split_index + fold_size]

        if len(test_rows) < 2:
            continue

        trained_model = train_model(
            {
                "rows": train_rows,
                "metadata": {},
            }
        )
        challenger_model = train_challenger_model(
            {
                "rows": train_rows,
                "metadata": {},
            }
        )
        lag_trend_model = train_lag_trend_model(
            {
                "rows": train_rows,
                "metadata": {},
            }
        )
        baseline_metrics = evaluate_rows(test_rows, None, "baseline")
        trained_metrics = evaluate_rows(
            test_rows, trained_model, "baseline"
        )
        challenger_metrics = evaluate_rows(
            test_rows, challenger_model, "challenger"
        )
        lag_trend_metrics = evaluate_rows(
            test_rows, lag_trend_model, "lag_trend"
        )

        folds.append(
            {
                "train_rows": len(train_rows),
                "test_rows": len(test_rows),
                "baseline_mae": baseline_metrics["mae"],
                "trained_mae": trained_metrics["mae"],
                "baseline_rmse": baseline_metrics["rmse"],
                "trained_rmse": trained_metrics["rmse"],
                "challenger_mae": challenger_metrics["mae"],
                "challenger_rmse": challenger_metrics["rmse"],
                "lag_trend_mae": lag_trend_metrics["mae"],
                "lag_trend_rmse": lag_trend_metrics["rmse"],
                "baseline_mape": baseline_metrics["mape"],
                "trained_mape": trained_metrics["mape"],
                "challenger_mape": challenger_metrics["mape"],
                "lag_trend_mape": lag_trend_metrics["mape"],
            }
        )

    if not folds:
        return {
            "fold_count": 0,
            "folds": [],
        }

    return {
        "fold_count": len(folds),
        "average_baseline_mae": round(
            sum(fold["baseline_mae"] for fold in folds) / len(folds), 4
        ),
        "average_trained_mae": round(
            sum(fold["trained_mae"] for fold in folds) / len(folds), 4
        ),
        "average_challenger_mae": round(
            sum(fold["challenger_mae"] for fold in folds) / len(folds), 4
        ),
        "average_lag_trend_mae": round(
            sum(fold["lag_trend_mae"] for fold in folds) / len(folds), 4
        ),
        "average_baseline_rmse": round(
            sum(fold["baseline_rmse"] for fold in folds) / len(folds), 4
        ),
        "average_trained_rmse": round(
            sum(fold["trained_rmse"] for fold in folds) / len(folds), 4
        ),
        "average_challenger_rmse": round(
            sum(fold["challenger_rmse"] for fold in folds) / len(folds), 4
        ),
        "average_lag_trend_rmse": round(
            sum(fold["lag_trend_rmse"] for fold in folds) / len(folds), 4
        ),
        "average_baseline_mape": round(
            sum(fold["baseline_mape"] for fold in folds) / len(folds), 4
        ),
        "average_trained_mape": round(
            sum(fold["trained_mape"] for fold in folds) / len(folds), 4
        ),
        "average_challenger_mape": round(
            sum(fold["challenger_mape"] for fold in folds) / len(folds), 4
        ),
        "average_lag_trend_mape": round(
            sum(fold["lag_trend_mape"] for fold in folds) / len(folds), 4
        ),
        "folds": folds,
    }


def predict_for_model(
    row: dict,
    trained_model: dict | None,
    model_type: str,
) -> float:
    if model_type == "challenger":
        return predict_challenger_units(row, trained_model)
    if model_type == "lag_trend":
        return predict_lag_trend_units(row, trained_model)
    return predict_units_from_row(row, trained_model)


def choose_winner(
    baseline_metrics: dict,
    trained_metrics: dict,
    challenger_metrics: dict,
    lag_trend_metrics: dict,
) -> str:
    candidates = {
        "baseline_without_training": baseline_metrics["mae"],
        "trained_baseline": trained_metrics["mae"],
        "trained_challenger": challenger_metrics["mae"],
        "trained_lag_trend": lag_trend_metrics["mae"],
    }

    return min(candidates, key=candidates.get)


def build_model_selection(report: dict) -> dict:
    winner = report["winner"]

    return {
        "winner": winner,
        "selected_at": report["model_summary"].get("trained_at")
        or report["challenger_summary"].get("trained_at")
        or report["lag_trend_summary"].get("trained_at"),
        "selection_metric": "holdout_mae",
        "supported_models": [
            "trained_baseline",
            "trained_challenger",
            "trained_lag_trend",
        ],
        "scores": {
            "trained_baseline": report["trained_baseline"]["mae"],
            "trained_challenger": report["trained_challenger"]["mae"],
            "trained_lag_trend": report["trained_lag_trend"]["mae"],
        },
        "time_based_scores": {
            "trained_baseline": report["time_based_validation"].get(
                "average_trained_mae"
            ),
            "trained_challenger": report["time_based_validation"].get(
                "average_challenger_mae"
            ),
            "trained_lag_trend": report["time_based_validation"].get(
                "average_lag_trend_mae"
            ),
        },
    }


def load_history() -> list[dict]:
    if not HISTORY_PATH.exists():
        return []

    return json.loads(HISTORY_PATH.read_text())


def append_history_entry(
    history: list[dict],
    report: dict,
    selection: dict,
) -> list[dict]:
    entry = {
        "selected_at": selection["selected_at"],
        "winner": selection["winner"],
        "selection_metric": selection["selection_metric"],
        "dataset": report["dataset"],
        "scores": selection["scores"],
        "time_based_scores": selection["time_based_scores"],
        "improvement": report["improvement"],
        "model_names": {
            "trained_baseline": report["model_summary"].get("model_name"),
            "trained_challenger": report["challenger_summary"].get(
                "model_name"
            ),
            "trained_lag_trend": report["lag_trend_summary"].get(
                "model_name"
            ),
        },
    }

    deduped_history = [
        existing
        for existing in history
        if existing.get("selected_at") != entry["selected_at"]
    ]
    deduped_history.append(entry)
    deduped_history.sort(key=lambda item: item.get("selected_at", ""))
    return deduped_history[-25:]


if __name__ == "__main__":
    main()
