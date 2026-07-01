import { LowStockSignal } from "./inventory-engine.types";

type InventoryThresholdState = {
  organizationId: string;
  id: string;
  productId: string;
  storeId: string;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
};

export const isLowStock = (inventory: Pick<InventoryThresholdState, "quantityAvailable" | "reorderLevel">) =>
  inventory.quantityAvailable < inventory.reorderLevel;

export const toLowStockSignal = (
  inventory: InventoryThresholdState,
  referenceMovementId?: string
): LowStockSignal | null => {
  if (!isLowStock(inventory)) {
    return null;
  }

  return {
    organizationId: inventory.organizationId,
    inventoryId: inventory.id,
    productId: inventory.productId,
    storeId: inventory.storeId,
    quantityAvailable: inventory.quantityAvailable,
    reorderLevel: inventory.reorderLevel,
    reorderQuantity: inventory.reorderQuantity,
    referenceMovementId,
  };
};
