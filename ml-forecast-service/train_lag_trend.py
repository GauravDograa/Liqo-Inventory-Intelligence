from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "training_dataset.json"
ARTIFACT_PATH = ROOT / "artifacts" / "lag_trend_model.json"


def train_model(dataset: dict[str, Any]) -> dict[str, Any]:
    rows = dataset.get("rows", [])
    if not rows:
        raise ValueError("training_dataset.json has no rows")

    category_ratios: dict[str, list[float]] = defaultdict(list)
    month_ratios: dict[str, list[float]] = defaultdict(list)
    trend_values: list[float] = []
    lag_values: list[float] = []

    for row in rows:
        target = float(row["target_units_sold_next_horizon"])
        observed = float(row["units_sold_window"])
        previous_window_units = max(float(row.get("previous_window_units", 0)), 1.0)
        if observed <= 0:
            continue

        category_key = normalize_key(row.get("category"))
        category_ratios[category_key].append(target / observed)
        month_key = str(row.get("anchor_month") or 0)
        month_ratios[month_key].append(target / observed)
        trend_values.append(float(row.get("short_term_trend_ratio", 1.0)))
        lag_values.append(target / previous_window_units)

    category_factors = {
        key: round(sum(values) / len(values), 4)
        for key, values in category_ratios.items()
    }
    month_factors = {
        key: round(sum(values) / len(values), 4)
        for key, values in month_ratios.items()
    }
    average_trend = sum(trend_values) / len(trend_values) if trend_values else 1.0
    average_lag_ratio = sum(lag_values) / len(lag_values) if lag_values else 1.0

    return {
        "model_name": "lag-trend-forecast-v1",
        "trained_at": dataset.get("metadata", {}).get("generatedAt")
        or "offline-training",
        "row_count": len(rows),
        "category_factors": category_factors,
        "month_factors": month_factors,
        "base_weight": 0.4,
        "lag_weight": round(min(max(average_lag_ratio / 4, 0.1), 0.35), 3),
        "trend_mix_weight": 0.35,
        "trend_weight": round(min(max((average_trend - 1) * 0.8, 0.15), 0.6), 3),
        "history_window_days": dataset.get("metadata", {}).get(
            "historyWindowDays"
        ),
        "horizon_days": dataset.get("metadata", {}).get("horizonDays"),
    }


def main() -> None:
    dataset = json.loads(DATASET_PATH.read_text())
    model = train_model(dataset)

    ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT_PATH.write_text(json.dumps(model, indent=2))
    print(json.dumps(model, indent=2))


def normalize_key(category: str | None) -> str:
    return (category or "unknown").strip().lower()


if __name__ == "__main__":
    main()
