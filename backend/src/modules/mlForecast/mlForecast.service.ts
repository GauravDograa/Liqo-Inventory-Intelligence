import {
  buildMlForecastRequest,
  FORECAST_FEATURE_DEFINITIONS,
  MlForecastRequest,
} from "../forecast/forecast.contract";
import { promises as fs } from "fs";
import path from "path";
import { runMockForecastModel } from "../forecast/forecast.mock-model";
import { RECOMMENDATION_RULES } from "../recommendation/recommendation.config";
import { buildTrainingDataset } from "./mlForecast.dataset";

const ARTIFACTS_DIR = path.resolve(
  process.cwd(),
  "..",
  "ml-forecast-service",
  "artifacts"
);
const MODEL_SELECTION_PATH = path.join(
  ARTIFACTS_DIR,
  "model_selection.json"
);
const MODEL_HISTORY_PATH = path.join(
  ARTIFACTS_DIR,
  "model_history.json"
);

export function getForecastContract() {
  return {
    endpoint: "/api/v2/ml-forecast/predict",
    fallbackEndpoint: "/api/v2/ml-forecast/mock-predict",
    supportedSources: [
      "historical_velocity",
      "ml_forecast",
      "external_ml_service",
    ],
    defaultModelName: "external-demand-forecast-v1",
    defaultHorizonDays:
      RECOMMENDATION_RULES.defaultForecastHorizonDays,
    defaultHistoryWindowDays:
      RECOMMENDATION_RULES.velocityWindowDays,
    featureDefinitions: FORECAST_FEATURE_DEFINITIONS,
    exampleRequest: buildMlForecastRequest({
      modelName: "external-demand-forecast-v1",
      source: "external_ml_service",
      context: {
        organizationId: "default-org-001",
        horizonDays:
          RECOMMENDATION_RULES.defaultForecastHorizonDays,
        historyWindowDays:
          RECOMMENDATION_RULES.velocityWindowDays,
      },
      features: [
        {
          organization_id: "default-org-001",
          store_id: "store-001",
          sku_id: "sku-001",
          category: "TV",
          anchor_month: 6,
          anchor_quarter: 2,
          anchor_week_of_year: 24,
          horizon_days:
            RECOMMENDATION_RULES.defaultForecastHorizonDays,
          history_window_days:
            RECOMMENDATION_RULES.velocityWindowDays,
          units_sold_window: 15,
          units_sold_last_30d: 5,
          units_sold_last_90d: 11,
          recent_demand_share: 0.33,
          observed_velocity_per_day: 0.08,
          previous_window_units: 12,
          short_term_trend_ratio: 1.25,
          planning_velocity_floor:
            RECOMMENDATION_RULES.minimumVelocityPerDay,
          current_units: 24,
          stock_age_days: 72,
          target_coverage_days: 21,
          safety_coverage_days: 10,
          gross_margin_pct: 31.5,
          mrp: 27999,
          acquisition_cost: 19100,
          deadstock_threshold_days: 75,
          store_rank_in_velocity: 2,
          peer_average_units: 18,
          peer_gap_units: -6,
          seasonal_index: 1.05,
          store_demand_confidence: 0.74,
        },
      ],
    }),
  };
}

export async function predictMockForecast(
  request: MlForecastRequest
) {
  return runMockForecastModel(
    request,
    request.source === "external_ml_service"
      ? "external_ml_service"
      : "ml_forecast"
  );
}

export async function getTrainingDataset(input: {
  organizationId: string;
  historyWindowDays?: number;
  horizonDays?: number;
  stepDays?: number;
}) {
  return buildTrainingDataset(input.organizationId, {
    historyWindowDays: input.historyWindowDays,
    horizonDays: input.horizonDays,
    stepDays: input.stepDays,
  });
}

export async function getModelSelection() {
  return readArtifactJson(MODEL_SELECTION_PATH, {
    winner: "trained_baseline",
    strategy: "fallback-default",
    selectionMetric: "holdout_mae",
    supportedModels: [
      "trained_baseline",
      "trained_challenger",
      "trained_lag_trend",
    ],
    scores: {
      trained_baseline: null,
      trained_challenger: null,
      trained_lag_trend: null,
    },
    timeBasedScores: {
      trained_baseline: null,
      trained_challenger: null,
      trained_lag_trend: null,
    },
  });
}

export async function getModelHistory() {
  return readArtifactJson(MODEL_HISTORY_PATH, []);
}

async function readArtifactJson<T>(
  filePath: string,
  fallback: T
): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeArtifactKeys(parsed) as T;
  } catch {
    return fallback;
  }
}

function normalizeArtifactKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeArtifactKeys);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => [toCamelCase(key), normalizeArtifactKeys(nestedValue)]
    )
  );
}

function toCamelCase(input: string) {
  return input.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
}
