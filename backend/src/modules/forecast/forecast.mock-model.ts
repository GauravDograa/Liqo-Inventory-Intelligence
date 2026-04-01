import {
  MlForecastRequest,
  MlForecastResponse,
} from "./forecast.contract";

export async function runMockForecastModel(
  request: MlForecastRequest,
  source: MlForecastResponse["predictions"][number]["source"]
) {
  const modelAdjustment =
    getModelAdjustment(request.modelName);
  const predictions: MlForecastResponse["predictions"] =
    request.features.map((feature) => {
      const baseDemand =
        feature.observed_velocity_per_day *
        feature.horizon_days;
      const marginFactor =
        feature.gross_margin_pct !== null
          ? 1 + Math.min(feature.gross_margin_pct / 400, 0.12)
          : 1;
      const ageFactor =
        feature.stock_age_days > feature.deadstock_threshold_days
          ? 0.96
          : 1.02;
      const imbalanceFactor =
        feature.peer_gap_units < 0
          ? 1.08
          : 1;
      const categoryFactor = getCategoryForecastMultiplier(
        feature.category
      );
      const seasonalFactor = feature.seasonal_index;
      const predictedDemandUnits = Math.max(
        baseDemand *
          categoryFactor *
          seasonalFactor *
          marginFactor *
          ageFactor *
          imbalanceFactor *
          modelAdjustment.demandMultiplier,
        1
      );

      return {
        storeId: feature.store_id,
        skuId: feature.sku_id,
        predictedDemandUnits: Number(
          predictedDemandUnits.toFixed(1)
        ),
        predictedVelocityPerDay: Number(
          (predictedDemandUnits / feature.horizon_days).toFixed(2)
        ),
        confidence: Number(
          Math.min(
            feature.store_demand_confidence +
              modelAdjustment.confidenceBoost,
            0.93
          ).toFixed(3)
        ),
        source,
        explanation: modelAdjustment.explanation,
      };
    });

  return {
    modelName: request.modelName,
    predictions,
  } satisfies MlForecastResponse;
}

function getModelAdjustment(modelName: string) {
  const normalized = modelName.trim().toLowerCase();

  if (normalized.includes("challenger")) {
    return {
      demandMultiplier: 0.94,
      confidenceBoost: 0.07,
      explanation:
        "Challenger mock forecast applies a more conservative demand multiplier with moderate confidence uplift.",
    };
  }

  if (normalized.includes("lag") || normalized.includes("trend")) {
    return {
      demandMultiplier: 1.08,
      confidenceBoost: 0.08,
      explanation:
        "Lag-trend mock forecast leans into short-term momentum and produces a more aggressive demand projection.",
    };
  }

  return {
    demandMultiplier: 1,
    confidenceBoost: 0.1,
    explanation:
      "Baseline mock forecast combines historical demand, category uplift, seasonal factor, margin, and peer imbalance.",
  };
}

function getCategoryForecastMultiplier(
  category: string | null
) {
  switch ((category || "").trim().toLowerCase()) {
    case "ac":
      return 1.18;
    case "tv":
      return 1.08;
    case "refrigerator":
      return 1.04;
    case "washing machine":
      return 1.06;
    default:
      return 1.05;
  }
}
