from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from statistics import median
from typing import Any


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "training_dataset.json"
ARTIFACT_PATH = ROOT / "artifacts" / "challenger_model.json"


def train_model(dataset: dict[str, Any]) -> dict[str, Any]:
    rows = dataset.get("rows", [])
    if not rows:
        raise ValueError("training_dataset.json has no rows")

    ratios_by_category: dict[str, list[float]] = defaultdict(list)
    ratios_by_month: dict[str, list[float]] = defaultdict(list)
    ratios_by_quarter: dict[str, list[float]] = defaultdict(list)
    absolute_percentage_errors: list[float] = []
    pressure_values: list[float] = []

    for row in rows:
        observed_demand = (
            row["observed_velocity_per_day"] * row["horizon_days"]
        )
        actual_demand = float(row["target_units_sold_next_horizon"])
        if observed_demand <= 0:
            continue

        ratio = actual_demand / observed_demand
        ratios_by_category[normalize_key(row.get("category"))].append(ratio)
        ratios_by_month[str(row.get("anchor_month") or 0)].append(ratio)
        ratios_by_quarter[str(row.get("anchor_quarter") or 0)].append(ratio)
        pressure_values.append(abs(float(row.get("peer_gap_units") or 0)))
        absolute_percentage_errors.append(
            abs(actual_demand - observed_demand) / max(actual_demand, 1.0)
        )

    category_factors = {
        key: round(median(values), 4) for key, values in ratios_by_category.items()
    }
    month_factors = {
        key: round(median(values), 4) for key, values in ratios_by_month.items()
    }
    quarter_factors = {
        key: round(median(values), 4) for key, values in ratios_by_quarter.items()
    }

    mean_ape = (
        sum(absolute_percentage_errors) / len(absolute_percentage_errors)
        if absolute_percentage_errors
        else 0.25
    )
    median_pressure = median(pressure_values) if pressure_values else 0.0

    return {
        "model_name": "challenger-shrunk-seasonal-v1",
        "trained_at": dataset.get("metadata", {}).get("generatedAt")
        or "offline-training",
        "row_count": len(rows),
        "category_factors": category_factors,
        "month_factors": month_factors,
        "quarter_factors": quarter_factors,
        "confidence_weight": round(max(0.3, min(0.7, 0.65 - mean_ape / 3)), 3),
        "inventory_pressure_floor": 0.82,
        "inventory_pressure_ceiling": round(
            max(1.05, min(1.2, 1.05 + median_pressure / 100)), 3
        ),
        "mean_absolute_percentage_error": round(mean_ape, 4),
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
