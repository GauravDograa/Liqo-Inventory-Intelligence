import { Prisma } from "@prisma/client";

export type InventoryTransactionClient = Prisma.TransactionClient;

export type InventoryDemand = {
  productId: string;
  quantity: number;
};

export type InventoryDeductionInput = {
  organizationId: string;
  storeId: string;
  productId: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  transactionId?: string;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
};

export type InventoryMovementType =
  | "SALE"
  | "PURCHASE"
  | "RETURN"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT"
  | "DAMAGE"
  | "RESTOCK";

export type InventoryAdjustmentInput = {
  organizationId: string;
  storeId: string;
  productId: string;
  quantityDelta: number;
  movementType?: Extract<InventoryMovementType, "ADJUSTMENT" | "DAMAGE" | "RESTOCK" | "RETURN">;
  reason:
    | "STOCK_CORRECTION"
    | "DAMAGE"
    | "SHRINKAGE"
    | "RETURN_TO_STOCK"
    | "OPENING_BALANCE"
    | "CYCLE_COUNT";
  note?: string;
  adjustedByUserId?: string;
  metadata?: Prisma.InputJsonValue;
};

export type InventoryMovementInput = {
  organizationId: string;
  inventoryId: string;
  productId: string;
  storeId: string;
  movementType: InventoryMovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: string;
  referenceId?: string;
  transactionId?: string;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
};

export type LowStockSignal = {
  organizationId: string;
  inventoryId: string;
  productId: string;
  storeId: string;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  referenceMovementId?: string;
};
