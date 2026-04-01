from __future__ import annotations


def predict_units_from_row(row: dict, trained_model: dict | None) -> float:
    base_demand = row["observed_velocity_per_day"] * row["horizon_days"]
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
    quarter_factor = get_lookup(
        trained_model,
        "quarter_factors",
        str(row.get("anchor_quarter") or 0),
        1.0,
    )
    confidence_weight = get_confidence_weight(trained_model)
    inventory_pressure = get_inventory_pressure(row, trained_model)
    margin_guard = get_margin_guard(row)
    seasonal_blend = row.get("seasonal_index", 1.0)

    adjusted = (
        base_demand
        * category_factor
        * month_factor
        * quarter_factor
        * seasonal_blend
        * inventory_pressure
        * margin_guard
    )

    # Blend forecast toward observed demand to stay conservative on sparse data.
    return max(
        base_demand * (1 - confidence_weight) + adjusted * confidence_weight,
        1,
    )


def get_confidence_weight(trained_model: dict | None) -> float:
    if trained_model:
        return float(trained_model.get("confidence_weight", 0.45))
    return 0.45


def get_inventory_pressure(row: dict, trained_model: dict | None) -> float:
    peer_gap_units = float(row.get("peer_gap_units", 0))
    current_units = float(row.get("current_units", 0))
    peer_average_units = max(float(row.get("peer_average_units", 1)), 1)
    stock_age_days = float(row.get("stock_age_days", 0))
    deadstock_threshold_days = max(float(row.get("deadstock_threshold_days", 1)), 1)

    understock_boost = 1.0 + max(-peer_gap_units, 0) / max(peer_average_units * 8, 1)
    overstock_drag = 1.0 - max(peer_gap_units, 0) / max(peer_average_units * 12, 1)
    age_drag = 1.0 - min(stock_age_days / (deadstock_threshold_days * 8), 0.08)
    raw_pressure = max(0.75, understock_boost * overstock_drag * age_drag)

    if trained_model:
        floor = float(trained_model.get("inventory_pressure_floor", 0.8))
        ceiling = float(trained_model.get("inventory_pressure_ceiling", 1.15))
        return max(floor, min(raw_pressure, ceiling))

    return max(0.8, min(raw_pressure, 1.15))


def get_margin_guard(row: dict) -> float:
    gross_margin_pct = row.get("gross_margin_pct")
    if gross_margin_pct is None:
        return 1.0
    return 1.0 + min(float(gross_margin_pct) / 1000, 0.05)


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
