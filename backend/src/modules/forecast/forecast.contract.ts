import type {
  DemandSignal,
  DemandSignalContext,
  DemandSignalSource,
} from "./forecast.service";

export type ForecastFeatureKey =
  | "organization_id"
  | "store_id"
  | "sku_id"
  | "category"
  | "anchor_month"
  | "anchor_quarter"
  | "anchor_week_of_year"
  | "horizon_days"
  | "history_window_days"
  | "units_sold_window"
  | "units_sold_last_30d"
  | "units_sold_last_90d"
  | "recent_demand_share"
  | "observed_velocity_per_day"
  | "previous_window_units"
  | "short_term_trend_ratio"
  | "planning_velocity_floor"
  | "current_units"
  | "stock_age_days"
  | "target_coverage_days"
  | "safety_coverage_days"
  | "gross_margin_pct"
  | "mrp"
  | "acquisition_cost"
  | "deadstock_threshold_days"
  | "store_rank_in_velocity"
  | "peer_average_units"
  | "peer_gap_units"
  | "seasonal_index"
  | "store_demand_confidence";

export interface ForecastFeatureDefinition {
  key: ForecastFeatureKey;
  label: string;
  type: "string" | "number";
  significance: string;
}

export interface ForecastFeatureRow {
  organization_id: string;
  store_id: string;
  sku_id: string;
  category: string | null;
  anchor_month: number;
  anchor_quarter: number;
  anchor_week_of_year: number;
  horizon_days: number;
  history_window_days: number;
  units_sold_window: number;
  units_sold_last_30d: number;
  units_sold_last_90d: number;
  recent_demand_share: number;
  observed_velocity_per_day: number;
  previous_window_units: number;
  short_term_trend_ratio: number;
  planning_velocity_floor: number;
  current_units: number;
  stock_age_days: number;
  target_coverage_days: number;
  safety_coverage_days: number;
  gross_margin_pct: number | null;
  mrp: number;
  acquisition_cost: number;
  deadstock_threshold_days: number;
  store_rank_in_velocity: number;
  peer_average_units: number;
  peer_gap_units: number;
  seasonal_index: number;
  store_demand_confidence: number;
}

export interface MlForecastRequest {
  modelName: string;
  source: DemandSignalSource;
  generatedAt: string;
  context: DemandSignalContext;
  features: ForecastFeatureRow[];
}

export interface MlForecastPrediction {
  storeId: string;
  skuId: string;
  predictedDemandUnits: number;
  predictedVelocityPerDay: number;
  confidence: number;
  source: DemandSignalSource;
  explanation?: string;
}

export interface MlForecastResponse {
  modelName: string;
  predictions: MlForecastPrediction[];
}

export interface ForecastModelProvider {
  name: string;
  version: string;
  predict(request: MlForecastRequest): Promise<MlForecastResponse>;
}

export const FORECAST_FEATURE_DEFINITIONS: ForecastFeatureDefinition[] = [
  {
    key: "organization_id",
    label: "Organization ID",
    type: "string",
    significance: "Supports tenant-safe training and prediction boundaries.",
  },
  {
    key: "store_id",
    label: "Store ID",
    type: "string",
    significance: "Captures location-specific demand behavior and store effects.",
  },
  {
    key: "sku_id",
    label: "SKU ID",
    type: "string",
    significance: "Lets the model learn item-level demand patterns.",
  },
  {
    key: "category",
    label: "Category",
    type: "string",
    significance: "Helps the model separate appliance categories with different cycles.",
  },
  {
    key: "anchor_month",
    label: "Anchor Month",
    type: "number",
    significance: "Lets the model learn month-specific demand seasonality.",
  },
  {
    key: "anchor_quarter",
    label: "Anchor Quarter",
    type: "number",
    significance: "Captures broader seasonal demand phases across the year.",
  },
  {
    key: "anchor_week_of_year",
    label: "Anchor Week of Year",
    type: "number",
    significance: "Adds finer time-position context without changing the business horizon.",
  },
  {
    key: "horizon_days",
    label: "Forecast Horizon",
    type: "number",
    significance: "Defines whether the model predicts short-, medium-, or longer-term demand.",
  },
  {
    key: "history_window_days",
    label: "History Window",
    type: "number",
    significance: "Tells the model how much trailing sales history informed the feature row.",
  },
  {
    key: "units_sold_window",
    label: "Units Sold in Window",
    type: "number",
    significance: "Strong baseline indicator of realized demand volume.",
  },
  {
    key: "units_sold_last_30d",
    label: "Units Sold Last 30 Days",
    type: "number",
    significance: "Captures the most recent demand burst or slowdown.",
  },
  {
    key: "units_sold_last_90d",
    label: "Units Sold Last 90 Days",
    type: "number",
    significance: "Adds medium-term demand context between short-term noise and full-window history.",
  },
  {
    key: "recent_demand_share",
    label: "Recent Demand Share",
    type: "number",
    significance: "Measures how much of the full history demand happened recently, helping detect acceleration.",
  },
  {
    key: "observed_velocity_per_day",
    label: "Observed Velocity Per Day",
    type: "number",
    significance: "Direct recent demand signal used today by the deterministic engine.",
  },
  {
    key: "previous_window_units",
    label: "Previous Window Units",
    type: "number",
    significance: "Captures the prior demand window for lag-based forecasting.",
  },
  {
    key: "short_term_trend_ratio",
    label: "Short-Term Trend Ratio",
    type: "number",
    significance: "Measures momentum between the latest history window and the preceding window.",
  },
  {
    key: "planning_velocity_floor",
    label: "Planning Velocity Floor",
    type: "number",
    significance: "Preserves the minimum operational demand assumption already used in planning.",
  },
  {
    key: "current_units",
    label: "Current Saleable Units",
    type: "number",
    significance: "Lets the model learn stock saturation and overstock effects.",
  },
  {
    key: "stock_age_days",
    label: "Stock Age Days",
    type: "number",
    significance: "Important for aging-sensitive demand and deadstock risk.",
  },
  {
    key: "target_coverage_days",
    label: "Target Coverage Days",
    type: "number",
    significance: "Anchors forecast outputs to business planning policy.",
  },
  {
    key: "safety_coverage_days",
    label: "Safety Coverage Days",
    type: "number",
    significance: "Preserves minimum operational buffer expectations.",
  },
  {
    key: "gross_margin_pct",
    label: "Gross Margin %",
    type: "number",
    significance: "Useful when prioritizing demand forecasts by economic value, not only unit demand.",
  },
  {
    key: "mrp",
    label: "MRP",
    type: "number",
    significance: "Supports revenue-oriented demand and opportunity calculations.",
  },
  {
    key: "acquisition_cost",
    label: "Acquisition Cost",
    type: "number",
    significance: "Supports margin and capital-efficiency aware predictions.",
  },
  {
    key: "deadstock_threshold_days",
    label: "Deadstock Threshold Days",
    type: "number",
    significance: "Aligns forecast outputs with category-specific aging rules.",
  },
  {
    key: "store_rank_in_velocity",
    label: "Store Rank in Velocity",
    type: "number",
    significance: "Captures relative store strength for a given SKU versus peer stores.",
  },
  {
    key: "peer_average_units",
    label: "Peer Average Units",
    type: "number",
    significance: "Lets the model reason about stock imbalance against network norms.",
  },
  {
    key: "peer_gap_units",
    label: "Peer Gap Units",
    type: "number",
    significance: "Measures how far a store sits above or below the network average.",
  },
  {
    key: "seasonal_index",
    label: "Seasonal Index",
    type: "number",
    significance: "Provides a future slot for seasonality without changing the request schema.",
  },
  {
    key: "store_demand_confidence",
    label: "Store Demand Confidence",
    type: "number",
    significance: "Helps downstream ranking weight uncertain predictions more carefully.",
  },
];

export function buildMlForecastRequest(input: {
  modelName: string;
  source: DemandSignalSource;
  context: DemandSignalContext;
  features: ForecastFeatureRow[];
}): MlForecastRequest {
  return {
    modelName: input.modelName,
    source: input.source,
    generatedAt: new Date().toISOString(),
    context: input.context,
    features: input.features,
  };
}

export function mergePredictionsIntoSignals(input: {
  baselineSignals: DemandSignal[];
  predictions: MlForecastPrediction[];
  source: DemandSignalSource;
}): DemandSignal[] {
  const predictionMap = new Map(
    input.predictions.map((prediction) => [
      `${prediction.storeId}_${prediction.skuId}`,
      prediction,
    ])
  );

  return input.baselineSignals.map((signal) => {
    const prediction = predictionMap.get(
      `${signal.storeId}_${signal.skuId}`
    );

    if (!prediction) {
      return signal;
    }

    return {
      ...signal,
      planningVelocityPerDay: Number(
        prediction.predictedVelocityPerDay.toFixed(2)
      ),
      projectedDemandUnits: Number(
        prediction.predictedDemandUnits.toFixed(1)
      ),
      confidence: Number(prediction.confidence.toFixed(3)),
      source: input.source,
      readyForModel: true,
    };
  });
}
