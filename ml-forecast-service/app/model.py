from __future__ import annotations

from .baseline import (
    get_confidence_boost,
    predict_units_from_row,
)
from .challenger import (
    predict_units_from_row as predict_challenger_units,
)
from .lag_trend import (
    predict_units_from_row as predict_lag_trend_units,
)
from .selection import load_selected_model, resolve_model_choice
from .schemas import MlForecastPrediction, MlForecastRequest, MlForecastResponse


def predict(request: MlForecastRequest) -> MlForecastResponse:
    model_key = resolve_model_choice(request.modelName)
    trained_model = load_selected_model(model_key)
    predictions: list[MlForecastPrediction] = []

    for feature in request.features:
        row = feature.model_dump()
        predicted_demand_units, explanation = predict_for_selected_model(
            row, trained_model, model_key
        )
        confidence_boost = get_confidence_boost_for_model(
            trained_model, model_key
        )

        predictions.append(
            MlForecastPrediction(
                storeId=feature.store_id,
                skuId=feature.sku_id,
                predictedDemandUnits=round(predicted_demand_units, 1),
                predictedVelocityPerDay=round(
                    predicted_demand_units / feature.horizon_days, 2
                ),
                confidence=round(
                    min(feature.store_demand_confidence + confidence_boost, 0.93), 3
                ),
                source="external_ml_service",
                explanation=explanation,
            )
        )

    return MlForecastResponse(
        modelName=model_key,
        predictions=predictions,
    )


def predict_for_selected_model(
    row: dict,
    trained_model: dict | None,
    model_key: str,
) -> tuple[float, str]:
    if model_key == "trained_challenger":
        return (
            predict_challenger_units(row, trained_model),
            "Challenger forecast blends observed demand with seasonal shrinkage and inventory pressure.",
        )
    if model_key == "trained_lag_trend":
        return (
            predict_lag_trend_units(row, trained_model),
            "Lag-trend forecast uses recent momentum and prior-window demand to project next-period demand.",
        )

    return (
        predict_units_from_row(row, trained_model),
        "Baseline forecast combines observed demand with trained category, seasonality, margin, and recency effects.",
    )


def get_confidence_boost_for_model(
    trained_model: dict | None,
    model_key: str,
) -> float:
    if model_key == "trained_challenger":
        if trained_model:
            return float(trained_model.get("confidence_weight", 0.1)) / 4
        return 0.1
    if model_key == "trained_lag_trend":
        if trained_model:
            return min(
                float(trained_model.get("trend_weight", 0.4)) / 6,
                0.1,
            )
        return 0.08

    return get_confidence_boost(trained_model)
