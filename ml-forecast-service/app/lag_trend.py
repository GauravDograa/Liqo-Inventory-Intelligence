from __future__ import annotations


def predict_units_from_row(row: dict, trained_model: dict | None) -> float:
    base_demand = row["observed_velocity_per_day"] * row["horizon_days"]
    previous_window_units = float(row.get("previous_window_units", 0))
    trend_ratio = float(row.get("short_term_trend_ratio", 1.0))
    lag_demand = previous_window_units * get_lag_weight(trained_model)
    trend_adjustment = get_trend_weight(trained_model) * normalize_trend(trend_ratio)
    category_factor = get_lookup(
        trained_model,
        "category_factors",
        normalize_key(row.get("category")),
        1.0,
    )
    month_factor = get_lookup(
        trained_model,
        "month_factors",
        str(row.get("anchor_month") or 0),
        1.0,
    )
    trend_demand = max(base_demand * (1 + trend_adjustment), 1)
    smoothed = (
        base_demand * get_base_weight(trained_model)
        + lag_demand
        + trend_demand * get_trend_mix_weight(trained_model)
    )

    return max(
        smoothed * category_factor * month_factor,
        1,
    )


def get_base_weight(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("base_weight", 0.45))
    return 0.45


def get_lag_weight(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("lag_weight", 0.2))
    return 0.2


def get_trend_mix_weight(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("trend_mix_weight", 0.35))
    return 0.35


def get_trend_weight(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("trend_weight", 0.4))
    return 0.4


def normalize_trend(trend_ratio: float) -> float:
    clamped = max(0.5, min(trend_ratio, 1.8))
    return clamped - 1.0


def get_lookup(
    trained_model: dict | None,
    collection_key: str,
    item_key: str,
    default: float,
) -> float:
    if trained_model and collection_key in trained_model:
        return float(trained_model[collection_key].get(item_key, default))
    return default


def normalize_key(category: str | None) -> str:
    return (category or "unknown").strip().lower()
