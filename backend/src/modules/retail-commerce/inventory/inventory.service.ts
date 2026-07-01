import { BadRequestError, NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./inventory.repository";
import {
  InventoryAdjustmentInput,
  InventoryDeductionInput,
  InventoryDemand,
  InventoryMovementType,
  InventoryTransactionClient,
  LowStockSignal,
} from "./inventory-engine.types";
import { publishInventoryAdjusted, publishInventoryDeducted, publishLowStockDetected } from "./inventory.events";
import { toLowStockSignal } from "./low-stock.util";

type InventoryEngineResult = {
  movement: {
    movementType: "SALE" | "ADJUSTMENT" | "DAMAGE" | "RESTOCK" | "RETURN";
    organizationId: string;
    inventoryId: string;
    productId: string;
    storeId: string;
    quantityChange: number;
    previousQuantity: number;
    newQuantity: number;
    referenceType?: string;
    referenceId?: string;
    transactionId?: string;
    reason?: string;
    metadata?: import("@prisma/client").Prisma.InputJsonValue;
  };
  lowStockSignal: LowStockSignal | null;
};

export type UpsertInventoryInput = {
  productId: string;
  storeId: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  quantityAvailable?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  safetyStockLevel?: number;
};

export const upsertInventory = (organizationId: string, data: UpsertInventoryInput) => {
  const quantityOnHand = data.quantityOnHand ?? 0;
  const quantityReserved = data.quantityReserved ?? 0;
  const quantityAvailable = data.quantityAvailable ?? quantityOnHand - quantityReserved;

  if (quantityAvailable < 0) {
    throw new BadRequestError("quantityAvailable cannot be negative");
  }

  return repo.upsertInventory(organizationId, {
    productId: data.productId,
    storeId: data.storeId,
    quantityOnHand,
    quantityReserved,
    quantityAvailable,
    reorderLevel: data.reorderLevel ?? 0,
    reorderQuantity: data.reorderQuantity ?? 0,
    safetyStockLevel: data.safetyStockLevel ?? 0,
    lastStocktakeAt: new Date(),
  });
};

export const listInventory = (organizationId: string, storeId?: string) =>
  repo.findInventory(organizationId, storeId);

export const getInventory = async (organizationId: string, id: string) => {
  const inventory = await repo.findInventoryById(organizationId, id);
  if (!inventory) {
    throw new NotFoundError("Inventory record not found");
  }

  return inventory;
};

export const validateInventoryAvailability = async (
  organizationId: string,
  storeId: string,
  demands: InventoryDemand[],
  tx?: InventoryTransactionClient
) => {
  const productIds = demands.map((demand) => demand.productId);
  const inventoryRows = await repo.findInventoryForProducts(
    organizationId,
    storeId,
    productIds,
    tx
  );
  const inventoryByProductId = new Map(
    inventoryRows.map((inventory) => [inventory.productId, inventory])
  );

  for (const demand of demands) {
    const inventory = inventoryByProductId.get(demand.productId);

    if (!inventory) {
      throw new BadRequestError(`Inventory is not configured for product ${demand.productId}`);
    }

    if (inventory.quantityAvailable < demand.quantity) {
      throw new BadRequestError(`Insufficient inventory for product ${demand.productId}`, {
        productId: demand.productId,
        requestedQuantity: demand.quantity,
        availableQuantity: inventory.quantityAvailable,
      });
    }
  }

  return inventoryByProductId;
};

const syncLowStockAlert = async (
  inventory: {
    organizationId: string;
    id: string;
    productId: string;
    storeId: string;
    quantityAvailable: number;
    reorderLevel: number;
    reorderQuantity: number;
  },
  tx: InventoryTransactionClient,
  referenceMovementId?: string
) => {
  const lowStockSignal = toLowStockSignal(inventory, referenceMovementId);

  if (!lowStockSignal) {
    await repo.resolveOpenLowStockAlerts(inventory.organizationId, inventory.id, tx);
    return null;
  }

  const existingAlert = await repo.findOpenLowStockAlert(
    inventory.organizationId,
    inventory.id,
    tx
  );

  if (!existingAlert) {
    await repo.createLowStockAlert(lowStockSignal, tx);
  }

  return lowStockSignal;
};

export const deductInventory = async (
  input: InventoryDeductionInput,
  tx: InventoryTransactionClient
) => {
  if (input.quantity <= 0) {
    throw new BadRequestError("Deduction quantity must be greater than zero");
  }

  const inventory = await repo.findInventoryByProductStore(
    input.organizationId,
    input.storeId,
    input.productId,
    tx
  );

  if (!inventory) {
    throw new BadRequestError(`Inventory is not configured for product ${input.productId}`);
  }

  if (inventory.quantityAvailable < input.quantity) {
    throw new BadRequestError(`Insufficient inventory for product ${input.productId}`, {
      productId: input.productId,
      requestedQuantity: input.quantity,
      availableQuantity: inventory.quantityAvailable,
    });
  }

  const previousQuantity = inventory.quantityAvailable;
  const updatedInventory = await repo.decrementAvailableInventory(
    inventory.id,
    input.quantity,
    tx
  );

  if (!updatedInventory) {
    throw new BadRequestError(`Insufficient inventory for product ${input.productId}`, {
      productId: input.productId,
      requestedQuantity: input.quantity,
    });
  }

  const movement = {
    organizationId: input.organizationId,
    inventoryId: inventory.id,
    productId: input.productId,
    storeId: input.storeId,
    movementType: "SALE" as const,
    quantityChange: -input.quantity,
    previousQuantity,
    newQuantity: updatedInventory.quantityAvailable,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    transactionId: input.transactionId,
    reason: input.reason,
    metadata: input.metadata,
  };

  const createdMovement = await repo.createInventoryMovement(movement, tx);
  const lowStockSignal = await syncLowStockAlert(
    updatedInventory,
    tx,
    createdMovement.id
  );

  return {
    inventory: updatedInventory,
    movement,
    lowStockSignal,
  };
};

export const adjustInventory = async (
  input: InventoryAdjustmentInput,
  tx: InventoryTransactionClient
) => {
  if (input.quantityDelta === 0) {
    throw new BadRequestError("Adjustment quantityDelta cannot be zero");
  }

  const inventory = await repo.findInventoryByProductStore(
    input.organizationId,
    input.storeId,
    input.productId,
    tx
  );

  if (!inventory) {
    throw new NotFoundError("Inventory record not found");
  }

  const previousQuantity = inventory.quantityAvailable;
  const updatedInventory = await repo.adjustAvailableInventory(
    inventory.id,
    input.quantityDelta,
    tx
  );

  if (!updatedInventory) {
    throw new BadRequestError("Inventory adjustment would make stock negative", {
      productId: input.productId,
      storeId: input.storeId,
      quantityDelta: input.quantityDelta,
      quantityAvailable: inventory.quantityAvailable,
    });
  }

  const movementType: InventoryMovementType =
    input.movementType ??
    (input.reason === "DAMAGE"
      ? "DAMAGE"
      : input.reason === "RETURN_TO_STOCK"
        ? "RETURN"
        : input.reason === "OPENING_BALANCE" && input.quantityDelta > 0
          ? "RESTOCK"
          : "ADJUSTMENT");

  const movement = {
    organizationId: input.organizationId,
    inventoryId: inventory.id,
    productId: input.productId,
    storeId: input.storeId,
    movementType,
    quantityChange: input.quantityDelta,
    previousQuantity,
    newQuantity: updatedInventory.quantityAvailable,
    referenceType: "INVENTORY_ADJUSTMENT",
    referenceId: inventory.id,
    reason: input.reason,
    metadata: {
      ...(typeof input.metadata === "object" && input.metadata && !Array.isArray(input.metadata)
        ? input.metadata
        : {}),
      note: input.note,
      adjustedByUserId: input.adjustedByUserId,
    },
  };

  const createdMovement = await repo.createInventoryMovement(movement, tx);
  const lowStockSignal = await syncLowStockAlert(
    updatedInventory,
    tx,
    createdMovement.id
  );

  return {
    inventory: updatedInventory,
    movement,
    lowStockSignal,
  };
};

export const recordInventoryAdjustment = async (
  input: InventoryAdjustmentInput
) => {
  const result = await repo.runInTransaction(async (tx) => adjustInventory(input, tx));
  await publishInventoryEngineEvents([result]);

  return result.inventory;
};

export const publishInventoryEngineEvents = async (
  movements: InventoryEngineResult[]
) => {
  for (const result of movements) {
    if (result.movement.movementType === "SALE") {
      await publishInventoryDeducted(result.movement);
    } else {
      await publishInventoryAdjusted(result.movement);
    }

    if (result.lowStockSignal) {
      await publishLowStockDetected(result.lowStockSignal as LowStockSignal);
    }
  }
};
