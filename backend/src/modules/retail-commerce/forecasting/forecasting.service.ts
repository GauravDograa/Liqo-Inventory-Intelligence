import { ForecastType } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./forecasting.repository";
import { buildForecastCandidates, historyWindow, resolveWorkflows } from "./forecasting-rules.util";
import { ForecastInventorySignal, ForecastVelocityPoint, ForecastWorkflow, GenerateForecastInput } from "./forecasting.types";

const defaultHorizonDays = 30;
const defaultHistoryWindowDays = 180;

const forecastTypes: ForecastType[] = [
  "DEMAND_FORECAST",
  "STOCKOUT_FORECAST",
  "REORDER_FORECAST",
  "FESTIVAL_FORECAST",
];

const workflows: ForecastWorkflow[] = [
  "PRODUCT_DEMAND_FORECASTING",
  "STOCKOUT_PREDICTION",
  "REORDER_FORECASTING",
  "SEASONAL_DEMAND_ANALYSIS",
  "FESTIVAL_DEMAND_FORECASTING",
];

const positiveInteger = (value: unknown, fallback: number, field: string) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }

  return parsed;
};

const parseForecastType = (value: unknown): ForecastType | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !forecastTypes.includes(value as ForecastType)) {
    throw new BadRequestError("type is invalid");
  }

  return value as ForecastType;
};

const parseWorkflow = (value: unknown): ForecastWorkflow | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !workflows.includes(value as ForecastWorkflow)) {
    throw new BadRequestError("workflow is invalid");
  }

  return value as ForecastWorkflow;
};

const parseDate = (value: unknown, field: string): Date | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" && !(value instanceof Date)) {
    throw new BadRequestError(`${field} is invalid`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`${field} is invalid`);
  }

  return date;
};

const stringValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const toInventorySignals = (
  rows: Awaited<ReturnType<typeof repo.findInventorySignals>>
): ForecastInventorySignal[] =>
  rows.map((row) => ({
    productId: row.productId,
    productName: row.product.name,
    productSku: row.product.sku,
    categoryName: row.product.category?.name ?? null,
    storeId: row.storeId,
    storeName: row.store.name,
    quantityAvailable: row.quantityAvailable,
    quantityOnHand: row.quantityOnHand,
    reorderLevel: row.reorderLevel,
    reorderQuantity: row.reorderQuantity,
    safetyStockLevel: row.safetyStockLevel,
  }));

const toVelocityPoints = (
  rows: Awaited<ReturnType<typeof repo.findVelocitySummaries>>
): ForecastVelocityPoint[] =>
  rows.map((row) => ({
    productId: row.productId,
    storeId: row.storeId,
    summaryDate: row.summaryDate,
    unitsSold: row.unitsSold,
    revenue: row.revenue,
    transactionCount: row.transactionCount,
  }));

export const generateForecasts = async (
  organizationId: string,
  input: Record<string, unknown>
) => {
  const parsed: GenerateForecastInput = {
    type: parseForecastType(input.type),
    workflow: parseWorkflow(input.workflow),
    productId: stringValue(input.productId),
    storeId: stringValue(input.storeId),
    horizonDays: positiveInteger(input.horizonDays, defaultHorizonDays, "horizonDays"),
    historyWindowDays: positiveInteger(input.historyWindowDays, defaultHistoryWindowDays, "historyWindowDays"),
    festivalName: stringValue(input.festivalName),
    festivalDate: parseDate(input.festivalDate, "festivalDate"),
  };

  const horizonStart = new Date();
  const window = historyWindow(horizonStart, parsed.historyWindowDays!);
  const workflowsToRun = resolveWorkflows(parsed.type, parsed.workflow);

  if (workflowsToRun.includes("FESTIVAL_DEMAND_FORECASTING") && !parsed.festivalName) {
    parsed.festivalName = "festival_period";
  }

  const [inventoryRows, velocityRows] = await Promise.all([
    repo.findInventorySignals(organizationId, {
      productId: parsed.productId,
      storeId: parsed.storeId,
    }),
    repo.findVelocitySummaries(organizationId, window.start, window.end, {
      productId: parsed.productId,
      storeId: parsed.storeId,
    }),
  ]);

  const inventory = toInventorySignals(inventoryRows);
  const velocity = toVelocityPoints(velocityRows);
  const candidates = buildForecastCandidates({
    inventory,
    velocity,
    workflows: workflowsToRun,
    horizonStart,
    horizonDays: parsed.horizonDays!,
    historyWindowDays: parsed.historyWindowDays!,
    festivalName: parsed.festivalName,
    festivalDate: parsed.festivalDate,
  });

  const created = await repo.runInTransaction(async (tx) => {
    const model = await repo.upsertRuleBasedModelMetadata(tx, organizationId, {
      horizonDays: parsed.horizonDays,
      historyWindowDays: parsed.historyWindowDays,
      workflows: workflowsToRun,
      features: [
        "product_store_daily_sales_velocity",
        "moving_average",
        "recent_30_day_trend",
        "month_seasonality_index",
        "festival_multiplier",
        "current_stock",
        "reorder_policy",
      ],
    });

    return repo.createForecasts(tx, organizationId, model.id, candidates);
  });

  return {
    generatedCount: created.length,
    candidatesEvaluated: candidates.length,
    workflows: workflowsToRun,
    horizonDays: parsed.horizonDays,
    historyWindowDays: parsed.historyWindowDays,
    source: {
      inventoryRows: inventory.length,
      velocityRows: velocity.length,
    },
    forecasts: created,
  };
};

export const listForecasts = (
  organizationId: string,
  filters: {
    type?: unknown;
    workflow?: unknown;
    productId?: unknown;
    storeId?: unknown;
  }
) =>
  repo.findForecasts(organizationId, {
    type: parseForecastType(filters.type),
    workflow: parseWorkflow(filters.workflow),
    productId: stringValue(filters.productId),
    storeId: stringValue(filters.storeId),
  });

export const getForecast = async (organizationId: string, id: string) => {
  const forecast = await repo.findForecastById(organizationId, id);

  if (!forecast) {
    throw new NotFoundError("Forecast not found");
  }

  return forecast;
};

export const getRecommendationForecastSignals = (organizationId: string, storeId?: string) =>
  repo.findLatestReorderForecasts(organizationId, storeId);
