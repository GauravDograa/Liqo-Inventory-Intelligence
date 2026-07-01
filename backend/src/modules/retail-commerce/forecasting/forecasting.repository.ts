import { ForecastType, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";
import { ForecastCandidate } from "./forecasting.types";

export const runInTransaction = <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(callback, { maxWait: 20_000, timeout: 120_000 });

export const findInventorySignals = (
  organizationId: string,
  filters: { productId?: string; storeId?: string }
) =>
  prisma.retailInventory.findMany({
    where: {
      organizationId,
      productId: filters.productId,
      storeId: filters.storeId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      store: true,
    },
  });

export const findVelocitySummaries = (
  organizationId: string,
  start: Date,
  end: Date,
  filters: { productId?: string; storeId?: string }
) =>
  prisma.productSalesVelocitySummary.findMany({
    where: {
      organizationId,
      productId: filters.productId,
      storeId: filters.storeId,
      summaryDate: { gte: start, lte: end },
    },
    orderBy: { summaryDate: "asc" },
  });

export const upsertRuleBasedModelMetadata = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  parameters: Prisma.InputJsonValue
) =>
  tx.forecastModelMetadata.upsert({
    where: {
      organizationId_name_version: {
        organizationId,
        name: "retail-rule-based-forecasting",
        version: "1.0.0",
      },
    },
    create: {
      organizationId,
      name: "retail-rule-based-forecasting",
      version: "1.0.0",
      provider: "rule_based",
      algorithm: "moving_average_with_trend_and_seasonality",
      description: "Initial deterministic forecasting foundation for retail demand, stockout, reorder, seasonal, and festival workflows.",
      parameters,
      metrics: {
        evaluationStatus: "pending_realized_demand_backtest",
      },
    },
    update: {
      parameters,
      isActive: true,
    },
  });

export const createForecasts = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  modelMetadataId: string,
  candidates: ForecastCandidate[]
) =>
  Promise.all(
    candidates.map((candidate) =>
      tx.forecast.create({
        data: {
          organizationId,
          modelMetadataId,
          type: candidate.type,
          workflow: candidate.workflow,
          productId: candidate.productId,
          storeId: candidate.storeId,
          horizonStart: candidate.horizonStart,
          horizonEnd: candidate.horizonEnd,
          horizonDays: candidate.horizonDays,
          predictedQuantity: candidate.predictedQuantity,
          salesVelocityPerDay: candidate.salesVelocityPerDay,
          movingAveragePerDay: candidate.movingAveragePerDay,
          trendMultiplier: candidate.trendMultiplier,
          seasonalMultiplier: candidate.seasonalMultiplier,
          festivalMultiplier: candidate.festivalMultiplier,
          confidenceScore: candidate.confidenceScore,
          explanation: candidate.explanation,
          stockoutRisk: candidate.stockoutRisk,
          daysUntilStockout: candidate.daysUntilStockout,
          recommendedReorderQuantity: candidate.recommendedReorderQuantity,
          reorderPoint: candidate.reorderPoint,
          currentStock: candidate.currentStock,
          signals: candidate.signals,
          metadata: candidate.metadata,
        },
      })
    )
  );

export const findForecasts = (
  organizationId: string,
  filters: {
    type?: ForecastType;
    workflow?: string;
    productId?: string;
    storeId?: string;
  }
) =>
  prisma.forecast.findMany({
    where: {
      organizationId,
      type: filters.type,
      workflow: filters.workflow,
      productId: filters.productId,
      storeId: filters.storeId,
    },
    include: {
      product: true,
      store: true,
      modelMetadata: true,
    },
    orderBy: [{ generatedAt: "desc" }, { confidenceScore: "desc" }],
    take: 200,
  });

export const findForecastById = (organizationId: string, id: string) =>
  prisma.forecast.findFirst({
    where: { id, organizationId },
    include: {
      product: true,
      store: true,
      modelMetadata: true,
    },
  });

export const findLatestReorderForecasts = (organizationId: string, storeId?: string) =>
  prisma.forecast.findMany({
    where: {
      organizationId,
      type: "REORDER_FORECAST",
      storeId,
      recommendedReorderQuantity: { gt: 0 },
    },
    include: {
      product: true,
      store: true,
    },
    orderBy: [{ generatedAt: "desc" }, { confidenceScore: "desc" }],
    take: 100,
  });
