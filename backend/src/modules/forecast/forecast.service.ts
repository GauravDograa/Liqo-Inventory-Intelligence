import { prisma } from "../../prisma/client";
import * as velocityService from "../velocity/velocity.service";
import { RECOMMENDATION_RULES } from "../recommendation/recommendation.config";
import {
  buildMlForecastRequest,
  mergePredictionsIntoSignals,
} from "./forecast.contract";
import { buildForecastFeatureRows } from "./forecast.blueprint";
import { runMockForecastModel } from "./forecast.mock-model";

export type DemandSignalSource =
  | "historical_velocity"
  | "ml_forecast"
  | "external_ml_service"
  | "forecast_override";

export interface DemandSignal {
  storeId: string;
  storeName: string | null;
  skuId: string;
  category: string | null;
  unitsSold: number;
  observedVelocityPerDay: number;
  planningVelocityPerDay: number;
  projectedDemandUnits: number;
  source: DemandSignalSource;
  confidence: number;
  readyForModel: boolean;
  horizonDays: number;
  historyWindowDays: number;
}

export interface DemandSignalSummary {
  source: DemandSignalSource;
  averageConfidence: number;
  modelReadyCoveragePct: number;
  horizonDays: number;
  historyWindowDays: number;
}

export interface DemandSignalOptions {
  horizonDays?: number;
  historyWindowDays?: number;
  storeId?: string;
  provider?: DemandSignalSource;
  modelName?: string;
}

export interface DemandSignalContext {
  organizationId: string;
  horizonDays: number;
  historyWindowDays: number;
  storeId?: string;
  modelName?: string;
}

interface DemandProvider {
  source: DemandSignalSource;
  getSignals(
    context: DemandSignalContext
  ): Promise<DemandSignal[]>;
}

const historicalVelocityProvider: DemandProvider = {
  source: "historical_velocity",
  async getSignals(context) {
    const velocityRows = await velocityService.getVelocity(
      context.organizationId,
      context.historyWindowDays,
      context.storeId
    );

    return velocityRows.map((row) => {
      const planningVelocityPerDay = Math.max(
        row.velocityPerDay,
        RECOMMENDATION_RULES.minimumVelocityPerDay
      );

      return {
        storeId: row.storeId,
        storeName: row.storeName,
        skuId: row.skuId,
        category: row.category,
        unitsSold: row.unitsSold,
        observedVelocityPerDay: row.velocityPerDay,
        planningVelocityPerDay,
        projectedDemandUnits: Number(
          (planningVelocityPerDay * context.horizonDays).toFixed(1)
        ),
        source: "historical_velocity" as const,
        confidence: buildHistoricalConfidence(
          row.unitsSold,
          row.velocityPerDay,
          context.historyWindowDays
        ),
        readyForModel: true,
        horizonDays: context.horizonDays,
        historyWindowDays: context.historyWindowDays,
      };
    });
  },
};

const mockMlForecastProvider: DemandProvider = {
  source: "ml_forecast",
  async getSignals(context) {
    const baseSignals =
      await historicalVelocityProvider.getSignals(context);
    const inventory = await prisma.inventory.findMany({
      where: {
        organizationId: context.organizationId,
        ...(context.storeId
          ? { storeId: context.storeId }
          : {}),
      },
      include: {
        store: true,
        sku: true,
      },
    });
    const features = buildForecastFeatureRows(
      inventory,
      baseSignals,
      context
    );
    const request = buildMlForecastRequest({
      modelName:
        context.modelName || "mock-demand-forecast-v1",
      source: "ml_forecast",
      context,
      features,
    });
    const response = await runMockForecastModel(
      request,
      "ml_forecast"
    );

    return mergePredictionsIntoSignals({
      baselineSignals: baseSignals,
      predictions: response.predictions,
      source: "ml_forecast",
    });
  },
};

const externalMlServiceProvider: DemandProvider = {
  source: "external_ml_service",
  async getSignals(context) {
    const baseSignals =
      await historicalVelocityProvider.getSignals(context);
    const inventory = await prisma.inventory.findMany({
      where: {
        organizationId: context.organizationId,
        ...(context.storeId
          ? { storeId: context.storeId }
          : {}),
      },
      include: {
        store: true,
        sku: true,
      },
    });
    const features = buildForecastFeatureRows(
      inventory,
      baseSignals,
      context
    );
    const request = buildMlForecastRequest({
      modelName:
        context.modelName ||
        process.env.ML_FORECAST_MODEL_NAME ||
        "external-demand-forecast-v1",
      source: "external_ml_service",
      context,
      features,
    });
    const response = await requestExternalForecast(request);

    return mergePredictionsIntoSignals({
      baselineSignals: baseSignals,
      predictions: response.predictions,
      source: "external_ml_service",
    });
  },
};

const providers: Record<DemandSignalSource, DemandProvider> = {
  historical_velocity: historicalVelocityProvider,
  ml_forecast: mockMlForecastProvider,
  external_ml_service: externalMlServiceProvider,
  forecast_override: historicalVelocityProvider,
};

export async function getDemandSignals(
  organizationId: string,
  options?: DemandSignalOptions
): Promise<{ signals: DemandSignal[]; summary: DemandSignalSummary }> {
  const context: DemandSignalContext = {
    organizationId,
    horizonDays:
      options?.horizonDays ||
      RECOMMENDATION_RULES.defaultForecastHorizonDays,
    historyWindowDays:
      options?.historyWindowDays ||
      RECOMMENDATION_RULES.velocityWindowDays,
    storeId: options?.storeId,
    modelName: options?.modelName,
  };
  const provider = resolveProvider(options?.provider);
  const signals = await provider.getSignals(context);

  return {
    signals,
    summary: buildDemandSummary(
      signals,
      provider.source,
      context
    ),
  };
}

export function resolveProvider(
  requested?: string
): DemandProvider {
  if (requested && requested in providers) {
    return providers[requested as DemandSignalSource];
  }

  const envProvider =
    process.env.DEMAND_SIGNAL_PROVIDER || "";

  if (envProvider && envProvider in providers) {
    return providers[envProvider as DemandSignalSource];
  }

  return historicalVelocityProvider;
}

function buildDemandSummary(
  signals: DemandSignal[],
  source: DemandSignalSource,
  context: DemandSignalContext
): DemandSignalSummary {
  const averageConfidence =
    signals.length > 0
      ? Number(
          (
            signals.reduce((sum, item) => sum + item.confidence, 0) /
            signals.length
          ).toFixed(3)
        )
      : 0;
  const readySignals = signals.filter((item) => item.readyForModel).length;

  return {
    source,
    averageConfidence,
    modelReadyCoveragePct:
      signals.length > 0
        ? Number(((readySignals / signals.length) * 100).toFixed(1))
        : 0,
    horizonDays: context.horizonDays,
    historyWindowDays: context.historyWindowDays,
  };
}

function buildHistoricalConfidence(
  unitsSold: number,
  velocityPerDay: number,
  historyWindowDays: number
) {
  const volumeScore = Math.min(unitsSold / 20, 1);
  const velocityScore = Math.min(velocityPerDay / 1.5, 1);
  const historyScore = Math.min(historyWindowDays / 180, 1);

  return Number(
    (0.45 + volumeScore * 0.25 + velocityScore * 0.2 + historyScore * 0.1).toFixed(
      3
    )
  );
}

async function requestExternalForecast(
  request: ReturnType<typeof buildMlForecastRequest>
) {
  const baseUrl = process.env.ML_FORECAST_API_URL;

  if (!baseUrl) {
    return runMockForecastModel(
      request,
      "external_ml_service"
    );
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(
      `External forecast service failed with status ${response.status}`
    );
  }

  return response.json();
}
