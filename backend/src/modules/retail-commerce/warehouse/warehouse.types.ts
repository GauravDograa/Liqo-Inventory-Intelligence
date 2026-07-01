import { Prisma, StockTransferStatus } from "@prisma/client";

export type TransferLineInput = {
  productId: string;
  quantity: number;
  suggestionSource?: string;
  signals?: Prisma.InputJsonValue;
};

export type CreateTransferInput = {
  sourceWarehouseId: string;
  destinationStoreId: string;
  items: TransferLineInput[];
  requestedByUserId?: string;
  expectedDispatchAt?: Date;
  expectedDeliveryAt?: Date;
  notes?: string;
  metadata?: Prisma.InputJsonValue;
};

export type DispatchTransferInput = {
  dispatchedByUserId?: string;
  dispatchReference?: string;
  trackingReference?: string;
};

export type DeliveryTransferInput = {
  deliveredByUserId?: string;
  deliveredQuantities?: Record<string, number>;
  notes?: string;
};

export type TransferActionInput = {
  userId?: string;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
};

export type ReplenishmentSuggestion = {
  productId: string;
  productName: string;
  productSku: string;
  destinationStoreId: string;
  destinationStoreName: string;
  sourceWarehouseId: string | null;
  sourceWarehouseName: string | null;
  suggestedQuantity: number;
  confidenceScore: number;
  suggestionSource: "LOW_STOCK_ALERT" | "REORDER_FORECAST" | "LOW_STOCK_AND_FORECAST";
  signals: Prisma.InputJsonValue;
};

export const terminalTransferStatuses: StockTransferStatus[] = ["DELIVERED", "CANCELLED"];
