import { Prisma, RecommendationDecisionAction, RecommendationType } from "@prisma/client";

export type VelocitySignal = {
  productId: string;
  storeId: string;
  unitsSold: number;
  revenue: Prisma.Decimal;
  transactionCount: number;
  velocityPerDay: number;
};

export type InventorySignal = {
  inventoryId: string;
  productId: string;
  productName: string;
  productSku: string;
  storeId: string;
  storeName: string;
  quantityAvailable: number;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
  velocityPerDay: number;
};

export type RecommendationCandidate = {
  type: RecommendationType;
  productId: string;
  sourceStoreId?: string;
  destinationStoreId?: string;
  quantity?: number;
  confidenceScore: Prisma.Decimal;
  reason: string;
  signals: Prisma.InputJsonValue;
  expectedImpact: Prisma.InputJsonValue;
  expiresAt?: Date;
};

export type RecommendationDecisionInput = {
  action: RecommendationDecisionAction;
  note?: string;
  decidedByUserId?: string;
  metadata?: Prisma.InputJsonValue;
};
