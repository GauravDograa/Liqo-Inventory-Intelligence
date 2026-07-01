import { Prisma, StockTransferStatus } from "@prisma/client";
import { prisma } from "../../../prisma/client";
import { TransferLineInput } from "./warehouse.types";

export const runInTransaction = <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(callback, { maxWait: 20_000, timeout: 120_000 });

export const findLocation = (organizationId: string, id: string) =>
  prisma.retailStore.findFirst({
    where: { id, organizationId },
  });

export const findWarehouses = (organizationId: string) =>
  prisma.retailStore.findMany({
    where: {
      organizationId,
      locationType: "WAREHOUSE",
      status: "ACTIVE",
    },
    orderBy: { name: "asc" },
  });

export const findWarehouseInventoryForProducts = (
  organizationId: string,
  warehouseId: string,
  productIds: string[],
  tx?: Prisma.TransactionClient
) =>
  (tx ?? prisma).retailInventory.findMany({
    where: {
      organizationId,
      storeId: warehouseId,
      productId: { in: productIds },
    },
    include: {
      product: true,
      store: true,
    },
  });

export const findInventoryByProductStore = (
  organizationId: string,
  storeId: string,
  productId: string,
  tx: Prisma.TransactionClient
) =>
  tx.retailInventory.findFirst({
    where: { organizationId, storeId, productId },
    include: { product: true, store: true },
  });

export const findBestWarehouseInventory = (organizationId: string, productId: string) =>
  prisma.retailInventory.findFirst({
    where: {
      organizationId,
      productId,
      quantityAvailable: { gt: 0 },
      store: {
        locationType: "WAREHOUSE",
        status: "ACTIVE",
      },
    },
    include: {
      product: true,
      store: true,
    },
    orderBy: { quantityAvailable: "desc" },
  });

export const createTransfer = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  data: {
    transferNo: string;
    sourceWarehouseId: string;
    destinationStoreId: string;
    requestedByUserId?: string;
    expectedDispatchAt?: Date;
    expectedDeliveryAt?: Date;
    notes?: string;
    metadata?: Prisma.InputJsonValue;
    items: TransferLineInput[];
  }
) =>
  tx.stockTransfer.create({
    data: {
      organizationId,
      transferNo: data.transferNo,
      sourceWarehouseId: data.sourceWarehouseId,
      destinationStoreId: data.destinationStoreId,
      requestedByUserId: data.requestedByUserId,
      expectedDispatchAt: data.expectedDispatchAt,
      expectedDeliveryAt: data.expectedDeliveryAt,
      notes: data.notes,
      metadata: data.metadata,
      items: {
        create: data.items.map((item) => ({
          organizationId,
          productId: item.productId,
          requestedQuantity: item.quantity,
          suggestionSource: item.suggestionSource,
          signals: item.signals,
        })),
      },
    },
    include: transferInclude,
  });

export const transferInclude = {
  sourceWarehouse: true,
  destinationStore: true,
  items: {
    include: {
      product: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export const findTransferById = (
  organizationId: string,
  id: string,
  tx?: Prisma.TransactionClient
) =>
  (tx ?? prisma).stockTransfer.findFirst({
    where: { id, organizationId },
    include: transferInclude,
  });

export const findTransfers = (
  organizationId: string,
  filters: {
    status?: StockTransferStatus;
    sourceWarehouseId?: string;
    destinationStoreId?: string;
  }
) =>
  prisma.stockTransfer.findMany({
    where: {
      organizationId,
      status: filters.status,
      sourceWarehouseId: filters.sourceWarehouseId,
      destinationStoreId: filters.destinationStoreId,
    },
    include: transferInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

export const updateTransferStatus = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
  data: Prisma.StockTransferUncheckedUpdateInput
) =>
  tx.stockTransfer.updateMany({
    where: { id, organizationId },
    data,
  });

export const updateTransferItemAllocation = (
  tx: Prisma.TransactionClient,
  itemId: string,
  data: {
    allocatedQuantity?: number;
    dispatchedQuantity?: number;
    deliveredQuantity?: number;
    sourceInventoryId?: string;
    destinationInventoryId?: string;
  }
) =>
  tx.transferItem.update({
    where: { id: itemId },
    data,
  });

export const reserveWarehouseInventory = async (
  tx: Prisma.TransactionClient,
  inventoryId: string,
  quantity: number
) => {
  const result = await tx.retailInventory.updateMany({
    where: {
      id: inventoryId,
      quantityAvailable: { gte: quantity },
    },
    data: {
      quantityAvailable: { decrement: quantity },
      quantityReserved: { increment: quantity },
    },
  });

  if (result.count === 0) {
    return null;
  }

  return tx.retailInventory.findUnique({ where: { id: inventoryId } });
};

export const releaseReservedWarehouseInventory = async (
  tx: Prisma.TransactionClient,
  inventoryId: string,
  quantity: number
) => {
  const result = await tx.retailInventory.updateMany({
    where: {
      id: inventoryId,
      quantityReserved: { gte: quantity },
    },
    data: {
      quantityReserved: { decrement: quantity },
      quantityAvailable: { increment: quantity },
    },
  });

  return result.count > 0;
};

export const dispatchReservedInventory = async (
  tx: Prisma.TransactionClient,
  inventoryId: string,
  quantity: number
) => {
  const before = await tx.retailInventory.findUnique({ where: { id: inventoryId } });

  if (!before) {
    return null;
  }

  const result = await tx.retailInventory.updateMany({
    where: {
      id: inventoryId,
      quantityReserved: { gte: quantity },
      quantityOnHand: { gte: quantity },
    },
    data: {
      quantityReserved: { decrement: quantity },
      quantityOnHand: { decrement: quantity },
    },
  });

  if (result.count === 0) {
    return null;
  }

  const after = await tx.retailInventory.findUnique({ where: { id: inventoryId } });
  return { before, after: after! };
};

export const receiveDestinationInventory = async (
  tx: Prisma.TransactionClient,
  organizationId: string,
  storeId: string,
  productId: string,
  quantity: number
) => {
  const before = await tx.retailInventory.findUnique({
    where: {
      productId_storeId: {
        productId,
        storeId,
      },
    },
  });

  const inventory = await tx.retailInventory.upsert({
    where: {
      productId_storeId: {
        productId,
        storeId,
      },
    },
    create: {
      organizationId,
      storeId,
      productId,
      quantityOnHand: quantity,
      quantityReserved: 0,
      quantityAvailable: quantity,
      reorderLevel: 0,
      reorderQuantity: 0,
      safetyStockLevel: 0,
      lastStocktakeAt: new Date(),
    },
    update: {
      quantityOnHand: { increment: quantity },
      quantityAvailable: { increment: quantity },
      lastStocktakeAt: new Date(),
    },
  });

  return { before, after: inventory };
};

export const createInventoryMovement = (
  tx: Prisma.TransactionClient,
  data: Prisma.InventoryMovementUncheckedCreateInput
) => tx.inventoryMovement.create({ data });

export const syncLowStockAlert = async (
  tx: Prisma.TransactionClient,
  inventory: {
    organizationId: string;
    id: string;
    productId: string;
    storeId: string;
    quantityAvailable: number;
    reorderLevel: number;
    reorderQuantity: number;
  },
  referenceMovementId?: string
) => {
  if (inventory.quantityAvailable >= inventory.reorderLevel) {
    await tx.lowStockAlert.updateMany({
      where: {
        organizationId: inventory.organizationId,
        inventoryId: inventory.id,
        status: "OPEN",
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });
    return;
  }

  const existing = await tx.lowStockAlert.findFirst({
    where: {
      organizationId: inventory.organizationId,
      inventoryId: inventory.id,
      status: "OPEN",
    },
  });

  if (!existing) {
    await tx.lowStockAlert.create({
      data: {
        organizationId: inventory.organizationId,
        inventoryId: inventory.id,
        productId: inventory.productId,
        storeId: inventory.storeId,
        quantityAvailable: inventory.quantityAvailable,
        reorderLevel: inventory.reorderLevel,
        reorderQuantity: inventory.reorderQuantity,
        referenceMovementId,
      },
    });
  }
};

export const findOpenLowStockAlerts = (organizationId: string, storeId?: string) =>
  prisma.lowStockAlert.findMany({
    where: {
      organizationId,
      storeId,
      status: "OPEN",
    },
    include: {
      product: true,
      store: true,
      inventory: true,
    },
    orderBy: { triggeredAt: "desc" },
    take: 100,
  });

export const findLatestReorderForecasts = (organizationId: string, storeId?: string) =>
  prisma.forecast.findMany({
    where: {
      organizationId,
      storeId,
      type: "REORDER_FORECAST",
      recommendedReorderQuantity: { gt: 0 },
    },
    include: {
      product: true,
      store: true,
    },
    orderBy: [{ generatedAt: "desc" }, { confidenceScore: "desc" }],
    take: 100,
  });
