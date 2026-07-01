import { ForecastType, Prisma } from "@prisma/client";

export type ForecastWorkflow =
  | "PRODUCT_DEMAND_FORECASTING"
  | "STOCKOUT_PREDICTION"
  | "REORDER_FORECASTING"
  | "SEASONAL_DEMAND_ANALYSIS"
  | "FESTIVAL_DEMAND_FORECASTING";

export type GenerateForecastInput = {
  type?: ForecastType;
  workflow?: ForecastWorkflow;
  productId?: string;
  storeId?: string;
  horizonDays?: number;
  historyWindowDays?: number;
  festivalName?: string;
  festivalDate?: Date;
};

export type ForecastVelocityPoint = {
  productId: string;
  storeId: string | null;
  summaryDate: Date;
  unitsSold: number;
  revenue: Prisma.Decimal;
  transactionCount: number;
};

export type ForecastInventorySignal = {
  productId: string;
  productName: string;
  productSku: string;
  categoryName: string | null;
  storeId: string;
  storeName: string;
  quantityAvailable: number;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
  safetyStockLevel: number;
};

export type ForecastCandidate = {
  type: ForecastType;
  workflow: ForecastWorkflow;
  productId: string;
  storeId: string;
  horizonStart: Date;
  horizonEnd: Date;
  horizonDays: number;
  predictedQuantity: Prisma.Decimal;
  salesVelocityPerDay: Prisma.Decimal;
  movingAveragePerDay: Prisma.Decimal;
  trendMultiplier: Prisma.Decimal;
  seasonalMultiplier: Prisma.Decimal;
  festivalMultiplier: Prisma.Decimal;
  confidenceScore: Prisma.Decimal;
  explanation: string;
  stockoutRisk?: Prisma.Decimal;
  daysUntilStockout?: number;
  recommendedReorderQuantity?: number;
  reorderPoint?: number;
  currentStock?: number;
  signals: Prisma.InputJsonValue;
  metadata: Prisma.InputJsonValue;
};
