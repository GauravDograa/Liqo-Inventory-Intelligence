import { randomUUID } from "crypto";
import { eventBus } from "../../../infrastructure/events";
import { InventoryMovementInput, LowStockSignal } from "./inventory-engine.types";

export const publishInventoryDeducted = async (movement: InventoryMovementInput) => {
  await eventBus.publish({
    id: randomUUID(),
    name: "retail.inventory.deducted",
    occurredAt: new Date(),
    aggregateId: movement.inventoryId,
    payload: movement,
  });
};

export const publishInventoryAdjusted = async (movement: InventoryMovementInput) => {
  await eventBus.publish({
    id: randomUUID(),
    name: "retail.inventory.adjusted",
    occurredAt: new Date(),
    aggregateId: movement.inventoryId,
    payload: movement,
  });
};

export const publishLowStockDetected = async (signal: LowStockSignal) => {
  await eventBus.publish({
    id: randomUUID(),
    name: "retail.inventory.low_stock_detected",
    occurredAt: new Date(),
    aggregateId: signal.inventoryId,
    payload: signal,
  });
};
