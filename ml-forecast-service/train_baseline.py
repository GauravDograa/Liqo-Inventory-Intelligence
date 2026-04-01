from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "training_dataset.json"
ARTIFACT_PATH = ROOT / "artifacts" / "baseline_model.json"


def train_model(dataset: dict[str, Any]) -> dict[str, Any]:
    rows = dataset.get("rows", [])
    if not rows:
        raise ValueError("training_dataset.json has no rows")

    global_numerator = 0.0
    global_denominator = 0.0
    category_stats: dict[str, dict[str, float]] = defaultdict(
        lambda: {"numerator": 0.0, "denominator": 0.0, "count": 0.0}
    )
    month_stats: dict[str, dict[str, float]] = defaultdict(
        lambda: {"numerator": 0.0, "denominator": 0.0, "count": 0.0}
    )
    quarter_stats: dict[str, dict[str, float]] = defaultdict(
        lambda: {"numerator": 0.0, "denominator": 0.0, "count": 0.0}
    )
    recent_share_values: list[float] = []
    recency_ratio_values: list[float] = []
    absolute_percentage_errors: list[float] = []

    for row in rows:
        observed_demand = (
            row["observed_velocity_per_day"] * row["horizon_days"]
        )
        target_demand = float(row["target_units_sold_next_horizon"])
        if observed_demand <= 0:
            continue

        global_numerator += target_demand
        global_denominator += observed_demand

        category = (row.get("category") or "unknown").strip().lower()
        category_stats[category]["numerator"] += target_demand
        category_stats[category]["denominator"] += observed_demand
        category_stats[category]["count"] += 1
        month_key = str(row.get("anchor_month") or 0)
        month_stats[month_key]["numerator"] += target_demand
        month_stats[month_key]["denominator"] += observed_demand
        month_stats[month_key]["count"] += 1
        quarter_key = str(row.get("anchor_quarter") or 0)
        quarter_stats[quarter_key]["numerator"] += target_demand
        quarter_stats[quarter_key]["denominator"] += observed_demand
        quarter_stats[quarter_key]["count"] += 1
        recent_share_values.append(float(row.get("recent_demand_share") or 0))
        last_30 = float(row.get("units_sold_last_30d") or 0)
        last_90 = max(float(row.get("units_sold_last_90d") or 0), 1.0)
        recency_ratio_values.append(last_30 / last_90)

        ape = abs(target_demand - observed_demand) / max(target_demand, 1.0)
        absolute_percentage_errors.append(ape)

    global_multiplier = (
        global_numerator / global_denominator if global_denominator > 0 else 1.0
    )

    category_multipliers: dict[str, float] = {}
    for category, stats in category_stats.items():
        if stats["denominator"] > 0:
            category_multipliers[category] = round(
                stats["numerator"] / stats["denominator"], 4
            )
    month_multipliers: dict[str, float] = {}
    for month, stats in month_stats.items():
        if stats["denominator"] > 0:
            month_multipliers[month] = round(
                stats["numerator"] / stats["denominator"], 4
            )
    quarter_multipliers: dict[str, float] = {}
    for quarter, stats in quarter_stats.items():
        if stats["denominator"] > 0:
            quarter_multipliers[quarter] = round(
                stats["numerator"] / stats["denominator"], 4
            )

    mean_ape = (
        sum(absolute_percentage_errors) / len(absolute_percentage_errors)
        if absolute_percentage_errors
        else 0.25
    )
    confidence_boost = round(max(0.03, min(0.12, 0.12 - mean_ape / 2)), 3)
    average_recent_share = (
        sum(recent_share_values) / len(recent_share_values)
        if recent_share_values
        else 0.18
    )
    average_recency_ratio = (
        sum(recency_ratio_values) / len(recency_ratio_values)
        if recency_ratio_values
        else 0.34
    )

    return {
        "model_name": "baseline-demand-ratio-v1",
        "trained_at": dataset.get("metadata", {}).get("generatedAt")
        or "offline-training",
        "row_count": len(rows),
        "global_multiplier": round(global_multiplier, 4),
        "category_multipliers": category_multipliers,
        "month_multipliers": month_multipliers,
        "quarter_multipliers": quarter_multipliers,
        "average_recent_share": round(average_recent_share, 4),
        "average_recency_ratio": round(average_recency_ratio, 4),
        "recency_floor": 0.9,
        "recency_ceiling": 1.12,
        "confidence_boost": confidence_boost,
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


if __name__ == "__main__":
    main()
