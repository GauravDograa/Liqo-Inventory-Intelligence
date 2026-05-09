import { BadRequestError, NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./inventory.repository";

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
