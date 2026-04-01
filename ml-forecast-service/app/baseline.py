from __future__ import annotations


def predict_units_from_row(row: dict, trained_model: dict | None) -> float:
    base_demand = row["observed_velocity_per_day"] * row["horizon_days"]
    margin_factor = get_margin_factor(row.get("gross_margin_pct"))
    age_factor = (
        0.96
        if row["stock_age_days"] > row["deadstock_threshold_days"]
        else 1.02
    )
    imbalance_factor = 1.08 if row["peer_gap_units"] < 0 else 1
    category_factor = get_category_forecast_multiplier(
        row.get("category"), trained_model
    )
    seasonal_factor = row["seasonal_index"]
    global_multiplier = get_global_multiplier(trained_model)
    month_factor = get_month_multiplier(
        row.get("anchor_month"), trained_model
    )
    quarter_factor = get_quarter_multiplier(
        row.get("anchor_quarter"), trained_model
    )
    recency_factor = get_recency_factor(row, trained_model)

    return max(
        base_demand
        * global_multiplier
        * category_factor
        * month_factor
        * quarter_factor
        * recency_factor
        * seasonal_factor
        * margin_factor
        * age_factor
        * imbalance_factor,
        1,
    )


def get_category_forecast_multiplier(
    category: str | None, trained_model: dict | None
) -> float:
    normalized = (category or "").strip().lower()

    if normalized == "ac":
        default = 1.18
    elif normalized == "tv":
        default = 1.08
    elif normalized == "refrigerator":
        default = 1.04
    elif normalized == "washing machine":
        default = 1.06
    else:
        default = 1.05

    if trained_model and "category_multipliers" in trained_model:
        return float(trained_model["category_multipliers"].get(normalized, default))

    return default


def get_global_multiplier(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("global_multiplier", 1.0))
    return 1.0


def get_month_multiplier(
    anchor_month: int | None, trained_model: dict | None
) -> float:
    if trained_model and "month_multipliers" in trained_model and anchor_month is not None:
        return float(trained_model["month_multipliers"].get(str(anchor_month), 1.0))
    return 1.0


def get_quarter_multiplier(
    anchor_quarter: int | None, trained_model: dict | None
) -> float:
    if trained_model and "quarter_multipliers" in trained_model and anchor_quarter is not None:
        return float(
            trained_model["quarter_multipliers"].get(str(anchor_quarter), 1.0)
        )
    return 1.0


def get_confidence_boost(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("confidence_boost", 0.1))
    return 0.1


def get_recency_factor(row: dict, trained_model: dict | None) -> float:
    last_30 = float(row.get("units_sold_last_30d", 0))
    last_90 = max(float(row.get("units_sold_last_90d", 0)), 1)
    recent_share = float(row.get("recent_demand_share", 0))
    recency_ratio = last_30 / last_90
    raw_factor = 1 + min(max(recency_ratio - 0.34, -0.2), 0.3) * 0.35
    share_adjustment = 1 + min(max(recent_share - 0.18, -0.15), 0.2) * 0.25
    combined = raw_factor * share_adjustment

    if trained_model:
        floor = float(trained_model.get("recency_floor", 0.9))
        ceiling = float(trained_model.get("recency_ceiling", 1.1))
        return max(floor, min(combined, ceiling))

    return max(0.9, min(combined, 1.1))


def get_margin_factor(gross_margin_pct: float | None) -> float:
    if gross_margin_pct is None:
        return 1
    return 1 + min(gross_margin_pct / 400, 0.12)
