import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";
import {
  InventoryMovementInput,
  InventoryTransactionClient,
  LowStockSignal,
} from "./inventory-engine.types";

const db = (tx?: InventoryTransactionClient) => tx ?? prisma;

export const runInTransaction = <T>(
  callback: (tx: InventoryTransactionClient) => Promise<T>
) => prisma.$transaction(callback);

export const upsertInventory = (
  organizationId: string,
  data: Omit<Prisma.RetailInventoryUncheckedCreateInput, "organizationId">
) => {
  return prisma.retailInventory.upsert({
    where: {
      productId_storeId: {
        productId: data.productId,
        storeId: data.storeId,
      },
    },
    create: {
      ...data,
      organizationId,
    },
    update: {
      quantityOnHand: data.quantityOnHand,
      quantityReserved: data.quantityReserved,
      quantityAvailable: data.quantityAvailable,
      reorderLevel: data.reorderLevel,
      reorderQuantity: data.reorderQuantity,
      safetyStockLevel: data.safetyStockLevel,
      lastStocktakeAt: data.lastStocktakeAt,
    },
    include: {
      product: true,
      store: true,
    },
  });
};

export const findInventory = (organizationId: string, storeId?: string) => {
  return prisma.retailInventory.findMany({
    where: {
      organizationId,
      storeId,
    },
    include: {
      product: true,
      store: true,
    },
    orderBy: [{ store: { name: "asc" } }, { product: { name: "asc" } }],
  });
};

export const findInventoryById = (organizationId: string, id: string) => {
  return prisma.retailInventory.findFirst({
    where: { id, organizationId },
    include: {
      product: true,
      store: true,
    },
  });
};

export const findInventoryByProductStore = (
  organizationId: string,
  storeId: string,
  productId: string,
  tx?: InventoryTransactionClient
) => {
  return db(tx).retailInventory.findFirst({
    where: {
      organizationId,
      storeId,
      productId,
    },
    include: {
      product: true,
      store: true,
    },
  });
};

export const findInventoryForProducts = (
  organizationId: string,
  storeId: string,
  productIds: string[],
  tx?: InventoryTransactionClient
) => {
  return db(tx).retailInventory.findMany({
    where: {
      organizationId,
      storeId,
      productId: { in: productIds },
    },
    include: {
      product: true,
      store: true,
    },
  });
};

export const decrementAvailableInventory = async (
  inventoryId: string,
  quantity: number,
  tx: InventoryTransactionClient
) => {
  const result = await tx.retailInventory.updateMany({
    where: {
      id: inventoryId,
      quantityAvailable: { gte: quantity },
      quantityOnHand: { gte: quantity },
    },
    data: {
      quantityOnHand: { decrement: quantity },
      quantityAvailable: { decrement: quantity },
    },
  });

  if (result.count === 0) {
    return null;
  }

  return tx.retailInventory.findUnique({
    where: { id: inventoryId },
    include: {
      product: true,
      store: true,
    },
  });
};

export const adjustAvailableInventory = async (
  inventoryId: string,
  quantityDelta: number,
  tx: InventoryTransactionClient
) => {
  const result = await tx.retailInventory.updateMany({
    where: {
      id: inventoryId,
      quantityOnHand: quantityDelta < 0 ? { gte: Math.abs(quantityDelta) } : undefined,
      quantityAvailable: quantityDelta < 0 ? { gte: Math.abs(quantityDelta) } : undefined,
    },
    data: {
      quantityOnHand: { increment: quantityDelta },
      quantityAvailable: { increment: quantityDelta },
      lastStocktakeAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return tx.retailInventory.findUnique({
    where: { id: inventoryId },
    include: {
      product: true,
      store: true,
    },
  });
};

export const createInventoryMovement = (
  data: InventoryMovementInput,
  tx: InventoryTransactionClient
) => {
  return tx.inventoryMovement.create({
    data,
  });
};

export const findOpenLowStockAlert = (
  organizationId: string,
  inventoryId: string,
  tx: InventoryTransactionClient
) => {
  return tx.lowStockAlert.findFirst({
    where: {
      organizationId,
      inventoryId,
      status: "OPEN",
    },
  });
};

export const createLowStockAlert = (
  signal: LowStockSignal,
  tx: InventoryTransactionClient
) => {
  return tx.lowStockAlert.create({
    data: {
      organizationId: signal.organizationId,
      inventoryId: signal.inventoryId,
      productId: signal.productId,
      storeId: signal.storeId,
      quantityAvailable: signal.quantityAvailable,
      reorderLevel: signal.reorderLevel,
      reorderQuantity: signal.reorderQuantity,
      referenceMovementId: signal.referenceMovementId,
    },
  });
};

export const resolveOpenLowStockAlerts = (
  organizationId: string,
  inventoryId: string,
  tx: InventoryTransactionClient
) => {
  return tx.lowStockAlert.updateMany({
    where: {
      organizationId,
      inventoryId,
      status: "OPEN",
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });
};
