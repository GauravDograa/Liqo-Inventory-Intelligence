import { ForecastType, Prisma } from "@prisma/client";
import {
  ForecastCandidate,
  ForecastInventorySignal,
  ForecastVelocityPoint,
  ForecastWorkflow,
} from "./forecasting.types";

const decimal = (value: Prisma.Decimal.Value, places = 2) =>
  new Prisma.Decimal(value).toDecimalPlaces(places);

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const dayMs = 24 * 60 * 60 * 1000;
const defaultLeadTimeDays = 7;

const forecastTypeByWorkflow: Record<ForecastWorkflow, ForecastType> = {
  PRODUCT_DEMAND_FORECASTING: "DEMAND_FORECAST",
  STOCKOUT_PREDICTION: "STOCKOUT_FORECAST",
  REORDER_FORECASTING: "REORDER_FORECAST",
  SEASONAL_DEMAND_ANALYSIS: "DEMAND_FORECAST",
  FESTIVAL_DEMAND_FORECASTING: "FESTIVAL_FORECAST",
};

const festivalMultiplierByName: Record<string, number> = {
  diwali: 1.35,
  deepavali: 1.35,
  dussehra: 1.2,
  navratri: 1.18,
  holi: 1.15,
  eid: 1.16,
  christmas: 1.2,
  "new year": 1.14,
  pongal: 1.12,
  onam: 1.12,
};

const daysBetween = (start: Date, end: Date) =>
  Math.max(1, Math.ceil((end.getTime() - start.getTime()) / dayMs));

const getHorizonEnd = (start: Date, horizonDays: number) => {
  const end = new Date(start);
  end.setDate(end.getDate() + horizonDays);
  return end;
};

const key = (productId: string, storeId: string) => `${productId}:${storeId}`;

const groupVelocity = (points: ForecastVelocityPoint[]) => {
  const map = new Map<string, ForecastVelocityPoint[]>();

  for (const point of points) {
    if (!point.storeId) {
      continue;
    }

    const pointKey = key(point.productId, point.storeId);
    map.set(pointKey, [...(map.get(pointKey) ?? []), point]);
  }

  return map;
};

const sumUnits = (points: ForecastVelocityPoint[]) =>
  points.reduce((sum, point) => sum + point.unitsSold, 0);

const movingAverage = (points: ForecastVelocityPoint[], historyWindowDays: number) =>
  sumUnits(points) / Math.max(historyWindowDays, 1);

const recentTrendMultiplier = (points: ForecastVelocityPoint[], horizonStart: Date) => {
  const sorted = [...points].sort((a, b) => a.summaryDate.getTime() - b.summaryDate.getTime());
  const recentStart = new Date(horizonStart);
  recentStart.setDate(recentStart.getDate() - 30);
  const previousStart = new Date(horizonStart);
  previousStart.setDate(previousStart.getDate() - 60);

  const recentUnits = sumUnits(sorted.filter((point) => point.summaryDate >= recentStart));
  const previousUnits = sumUnits(
    sorted.filter((point) => point.summaryDate >= previousStart && point.summaryDate < recentStart)
  );

  if (recentUnits === 0 && previousUnits === 0) {
    return 1;
  }

  return clamp((recentUnits + 1) / (previousUnits + 1), 0.65, 1.55);
};

const seasonalMultiplier = (points: ForecastVelocityPoint[], targetMonth: number) => {
  const totalUnits = sumUnits(points);

  if (totalUnits <= 0 || points.length < 14) {
    return 1;
  }

  const monthUnits = sumUnits(points.filter((point) => point.summaryDate.getMonth() === targetMonth));
  const monthDays = Math.max(
    new Set(points.filter((point) => point.summaryDate.getMonth() === targetMonth).map((point) => point.summaryDate.toDateString())).size,
    1
  );
  const totalDays = Math.max(new Set(points.map((point) => point.summaryDate.toDateString())).size, 1);
  const monthAverage = monthUnits / monthDays;
  const overallAverage = totalUnits / totalDays;

  if (overallAverage <= 0) {
    return 1;
  }

  return clamp(monthAverage / overallAverage, 0.75, 1.35);
};

const festivalMultiplier = (festivalName?: string) => {
  if (!festivalName) {
    return 1;
  }

  const normalized = festivalName.trim().toLowerCase();
  return festivalMultiplierByName[normalized] ?? 1.1;
};

const confidenceScore = (input: {
  historyDaysWithSales: number;
  totalUnits: number;
  trendMultiplier: number;
  seasonalMultiplier: number;
  festivalMultiplier: number;
}) => {
  const historyScore = Math.min(input.historyDaysWithSales / 45, 1) * 0.28;
  const volumeScore = Math.min(input.totalUnits / 60, 1) * 0.28;
  const trendPenalty = Math.min(Math.abs(input.trendMultiplier - 1), 0.5) * 0.18;
  const seasonalPenalty = Math.min(Math.abs(input.seasonalMultiplier - 1), 0.35) * 0.12;
  const festivalPenalty = input.festivalMultiplier > 1 ? 0.05 : 0;

  return decimal(clamp(0.42 + historyScore + volumeScore - trendPenalty - seasonalPenalty - festivalPenalty, 0.25, 0.96));
};

const stockoutRisk = (daysUntilStockout: number | undefined, horizonDays: number) => {
  if (daysUntilStockout === undefined) {
    return decimal(0.08);
  }

  if (daysUntilStockout <= horizonDays) {
    return decimal(0.82);
  }

  if (daysUntilStockout <= horizonDays * 1.5) {
    return decimal(0.58);
  }

  if (daysUntilStockout <= horizonDays * 2) {
    return decimal(0.32);
  }

  return decimal(0.12);
};

const buildExplanation = (input: {
  workflow: ForecastWorkflow;
  productName: string;
  storeName: string;
  predictedQuantity: number;
  horizonDays: number;
  movingAveragePerDay: number;
  trendMultiplier: number;
  seasonalMultiplier: number;
  festivalMultiplier: number;
  festivalName?: string;
}) => {
  const base = `${input.productName} at ${input.storeName} is forecast at ${input.predictedQuantity.toFixed(1)} units over ${input.horizonDays} days using moving-average sales velocity.`;
  const modifiers = ` Trend ${input.trendMultiplier.toFixed(2)}x, seasonal ${input.seasonalMultiplier.toFixed(2)}x, festival ${input.festivalMultiplier.toFixed(2)}x.`;

  if (input.workflow === "STOCKOUT_PREDICTION") {
    return `${base} Stockout risk uses current stock divided by adjusted velocity.${modifiers}`;
  }

  if (input.workflow === "REORDER_FORECASTING") {
    return `${base} Reorder quantity compares forecast demand, lead-time cover, safety stock, and current availability.${modifiers}`;
  }

  if (input.workflow === "SEASONAL_DEMAND_ANALYSIS") {
    return `${base} Seasonal analysis compares target-month demand with the product-store average.${modifiers}`;
  }

  if (input.workflow === "FESTIVAL_DEMAND_FORECASTING") {
    return `${base} Festival uplift${input.festivalName ? ` for ${input.festivalName}` : ""} is layered on top of velocity and seasonality.${modifiers}`;
  }

  return `${base}${modifiers}`;
};

export const buildForecastCandidates = (input: {
  inventory: ForecastInventorySignal[];
  velocity: ForecastVelocityPoint[];
  workflows: ForecastWorkflow[];
  horizonStart: Date;
  horizonDays: number;
  historyWindowDays: number;
  festivalName?: string;
  festivalDate?: Date;
}): ForecastCandidate[] => {
  const horizonStart = input.festivalDate ?? input.horizonStart;
  const horizonEnd = getHorizonEnd(horizonStart, input.horizonDays);
  const velocityByProductStore = groupVelocity(input.velocity);

  return input.inventory.flatMap((item) => {
    const points = velocityByProductStore.get(key(item.productId, item.storeId)) ?? [];
    const totalUnits = sumUnits(points);
    const historyDaysWithSales = new Set(points.filter((point) => point.unitsSold > 0).map((point) => point.summaryDate.toDateString())).size;
    const movingAveragePerDay = movingAverage(points, input.historyWindowDays);
    const trend = recentTrendMultiplier(points, input.horizonStart);
    const seasonal = seasonalMultiplier(points, horizonStart.getMonth());
    const festival = festivalMultiplier(input.festivalName);
    const adjustedVelocity = movingAveragePerDay * trend * seasonal * festival;
    const predictedQuantity = Math.max(0, adjustedVelocity * input.horizonDays);
    const daysUntilStockout =
      adjustedVelocity > 0 ? Math.max(0, Math.floor(item.quantityAvailable / adjustedVelocity)) : undefined;
    const reorderPoint = Math.ceil(adjustedVelocity * defaultLeadTimeDays) + item.safetyStockLevel;
    const recommendedReorderQuantity = Math.max(
      0,
      Math.ceil(predictedQuantity + reorderPoint - item.quantityAvailable)
    );
    const confidence = confidenceScore({
      historyDaysWithSales,
      totalUnits,
      trendMultiplier: trend,
      seasonalMultiplier: seasonal,
      festivalMultiplier: festival,
    });

    return input.workflows.map((workflow) => {
      const workflowFestivalMultiplier = workflow === "FESTIVAL_DEMAND_FORECASTING" ? festival : 1;
      const workflowPredictedQuantity =
        workflow === "FESTIVAL_DEMAND_FORECASTING"
          ? predictedQuantity
          : Math.max(0, movingAveragePerDay * trend * seasonal * input.horizonDays);
      const explanation = buildExplanation({
        workflow,
        productName: item.productName,
        storeName: item.storeName,
        predictedQuantity: workflowPredictedQuantity,
        horizonDays: input.horizonDays,
        movingAveragePerDay,
        trendMultiplier: trend,
        seasonalMultiplier: seasonal,
        festivalMultiplier: workflowFestivalMultiplier,
        festivalName: input.festivalName,
      });

      return {
        type: forecastTypeByWorkflow[workflow],
        workflow,
        productId: item.productId,
        storeId: item.storeId,
        horizonStart,
        horizonEnd,
        horizonDays: input.horizonDays,
        predictedQuantity: decimal(workflowPredictedQuantity),
        salesVelocityPerDay: decimal(adjustedVelocity, 4),
        movingAveragePerDay: decimal(movingAveragePerDay, 4),
        trendMultiplier: decimal(trend, 4),
        seasonalMultiplier: decimal(seasonal, 4),
        festivalMultiplier: decimal(workflowFestivalMultiplier, 4),
        confidenceScore: confidence,
        explanation,
        stockoutRisk: workflow === "STOCKOUT_PREDICTION" ? stockoutRisk(daysUntilStockout, input.horizonDays) : undefined,
        daysUntilStockout: workflow === "STOCKOUT_PREDICTION" ? daysUntilStockout : undefined,
        recommendedReorderQuantity: workflow === "REORDER_FORECASTING" ? recommendedReorderQuantity : undefined,
        reorderPoint: workflow === "REORDER_FORECASTING" ? reorderPoint : undefined,
        currentStock: item.quantityAvailable,
        signals: {
          historyWindowDays: input.historyWindowDays,
          totalUnitsSold: totalUnits,
          historyDaysWithSales,
          salesVelocityPerDay: Number(adjustedVelocity.toFixed(4)),
          currentStock: item.quantityAvailable,
          reorderLevel: item.reorderLevel,
          reorderQuantity: item.reorderQuantity,
          safetyStockLevel: item.safetyStockLevel,
          daysUntilStockout,
        },
        metadata: {
          approach: "rule_based_time_series_foundation",
          modelReady: true,
          categoryName: item.categoryName,
          festivalName: input.festivalName,
          festivalDate: input.festivalDate?.toISOString(),
          leadTimeDays: defaultLeadTimeDays,
          downstreamIntegrations: ["analytics", "recommendations"],
        },
      };
    });
  });
};

export const resolveWorkflows = (type?: ForecastType, workflow?: ForecastWorkflow): ForecastWorkflow[] => {
  if (workflow) {
    return [workflow];
  }

  if (type === "DEMAND_FORECAST") {
    return ["PRODUCT_DEMAND_FORECASTING", "SEASONAL_DEMAND_ANALYSIS"];
  }

  if (type === "STOCKOUT_FORECAST") {
    return ["STOCKOUT_PREDICTION"];
  }

  if (type === "REORDER_FORECAST") {
    return ["REORDER_FORECASTING"];
  }

  if (type === "FESTIVAL_FORECAST") {
    return ["FESTIVAL_DEMAND_FORECASTING"];
  }

  return [
    "PRODUCT_DEMAND_FORECASTING",
    "STOCKOUT_PREDICTION",
    "REORDER_FORECASTING",
    "SEASONAL_DEMAND_ANALYSIS",
    "FESTIVAL_DEMAND_FORECASTING",
  ];
};

export const historyWindow = (anchor: Date, historyWindowDays: number) => {
  const start = new Date(anchor);
  start.setDate(start.getDate() - historyWindowDays);
  return { start, end: anchor };
};
