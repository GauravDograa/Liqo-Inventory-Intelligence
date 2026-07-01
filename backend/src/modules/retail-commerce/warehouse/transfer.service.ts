import { Prisma, StockTransferStatus } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./warehouse.repository";
import { assertWarehouseAndStore } from "./warehouse.service";
import {
  CreateTransferInput,
  DeliveryTransferInput,
  DispatchTransferInput,
  terminalTransferStatuses,
  TransferActionInput,
  TransferLineInput,
} from "./warehouse.types";

const validStatuses: StockTransferStatus[] = [
  "PENDING",
  "APPROVED",
  "ALLOCATED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const parseStatus = (value: unknown): StockTransferStatus | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !validStatuses.includes(value as StockTransferStatus)) {
    throw new BadRequestError("status is invalid");
  }

  return value as StockTransferStatus;
};

const stringValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const parseDate = (value: unknown, field: string): Date | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`${field} is invalid`);
  }

  return date;
};

const parsePositiveInteger = (value: unknown, field: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }

  return parsed;
};

const parseItems = (value: unknown): TransferLineInput[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestError("items are required");
  }

  const seen = new Set<string>();
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new BadRequestError(`items[${index}] is invalid`);
    }

    const item = raw as Record<string, unknown>;
    const productId = stringValue(item.productId);
    if (!productId) {
      throw new BadRequestError(`items[${index}].productId is required`);
    }

    if (seen.has(productId)) {
      throw new BadRequestError(`Duplicate productId in transfer items: ${productId}`);
    }
    seen.add(productId);

    return {
      productId,
      quantity: parsePositiveInteger(item.quantity, `items[${index}].quantity`),
      suggestionSource: stringValue(item.suggestionSource),
      signals: item.signals && typeof item.signals === "object" ? item.signals as Prisma.InputJsonValue : undefined,
    };
  });
};

const parseCreateInput = (body: Record<string, unknown>): CreateTransferInput => {
  const sourceWarehouseId = stringValue(body.sourceWarehouseId);
  const destinationStoreId = stringValue(body.destinationStoreId);

  if (!sourceWarehouseId) {
    throw new BadRequestError("sourceWarehouseId is required");
  }

  if (!destinationStoreId) {
    throw new BadRequestError("destinationStoreId is required");
  }

  return {
    sourceWarehouseId,
    destinationStoreId,
    items: parseItems(body.items),
    requestedByUserId: stringValue(body.requestedByUserId),
    expectedDispatchAt: parseDate(body.expectedDispatchAt, "expectedDispatchAt"),
    expectedDeliveryAt: parseDate(body.expectedDeliveryAt, "expectedDeliveryAt"),
    notes: stringValue(body.notes),
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata as Prisma.InputJsonValue : undefined,
  };
};

const transferNo = () => `TRF-${Date.now()}`;

const getTransferOrThrow = async (
  organizationId: string,
  id: string,
  tx?: Prisma.TransactionClient
) => {
  const transfer = await repo.findTransferById(organizationId, id, tx);
  if (!transfer) {
    throw new NotFoundError("Stock transfer not found");
  }

  return transfer;
};

const ensureStatus = (actual: StockTransferStatus, expected: StockTransferStatus[]) => {
  if (!expected.includes(actual)) {
    throw new BadRequestError(`Transfer status must be ${expected.join(" or ")}`);
  }
};

export const createTransfer = async (
  organizationId: string,
  body: Record<string, unknown>
) => {
  const input = parseCreateInput(body);
  await assertWarehouseAndStore(organizationId, input.sourceWarehouseId, input.destinationStoreId);

  return repo.runInTransaction((tx) =>
    repo.createTransfer(tx, organizationId, {
      ...input,
      transferNo: transferNo(),
    })
  );
};

export const listTransfers = (
  organizationId: string,
  filters: {
    status?: unknown;
    sourceWarehouseId?: unknown;
    destinationStoreId?: unknown;
  }
) =>
  repo.findTransfers(organizationId, {
    status: parseStatus(filters.status),
    sourceWarehouseId: stringValue(filters.sourceWarehouseId),
    destinationStoreId: stringValue(filters.destinationStoreId),
  });

export const getTransfer = (organizationId: string, id: string) =>
  getTransferOrThrow(organizationId, id);

export const approveTransfer = async (
  organizationId: string,
  id: string,
  input: TransferActionInput
) =>
  repo.runInTransaction(async (tx) => {
    const transfer = await getTransferOrThrow(organizationId, id, tx);
    ensureStatus(transfer.status, ["PENDING"]);

    await repo.updateTransferStatus(tx, organizationId, id, {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedByUserId: input.userId,
      metadata: input.metadata,
    });

    return getTransferOrThrow(organizationId, id, tx);
  });

export const allocateTransfer = async (
  organizationId: string,
  id: string,
  input: TransferActionInput
) =>
  repo.runInTransaction(async (tx) => {
    const transfer = await getTransferOrThrow(organizationId, id, tx);
    ensureStatus(transfer.status, ["APPROVED"]);

    const productIds = transfer.items.map((item) => item.productId);
    const inventoryRows = await repo.findWarehouseInventoryForProducts(
      organizationId,
      transfer.sourceWarehouseId,
      productIds,
      tx
    );
    const inventoryByProductId = new Map(inventoryRows.map((row) => [row.productId, row]));

    for (const item of transfer.items) {
      const sourceInventory = inventoryByProductId.get(item.productId);

      if (!sourceInventory) {
        throw new BadRequestError(`Warehouse inventory is not configured for product ${item.product.sku}`);
      }

      if (sourceInventory.quantityAvailable < item.requestedQuantity) {
        throw new BadRequestError(`Insufficient warehouse stock for ${item.product.sku}`, {
          productId: item.productId,
          requestedQuantity: item.requestedQuantity,
          availableQuantity: sourceInventory.quantityAvailable,
        });
      }
    }

    for (const item of transfer.items) {
      const sourceInventory = inventoryByProductId.get(item.productId)!;
      const updated = await repo.reserveWarehouseInventory(tx, sourceInventory.id, item.requestedQuantity);

      if (!updated) {
        throw new BadRequestError(`Warehouse stock changed before allocation for ${item.product.sku}`);
      }

      await repo.updateTransferItemAllocation(tx, item.id, {
        allocatedQuantity: item.requestedQuantity,
        sourceInventoryId: sourceInventory.id,
      });
      await repo.syncLowStockAlert(tx, updated);
    }

    await repo.updateTransferStatus(tx, organizationId, id, {
      status: "ALLOCATED",
      allocatedAt: new Date(),
      allocatedByUserId: input.userId,
    });

    return getTransferOrThrow(organizationId, id, tx);
  });

export const dispatchTransfer = async (
  organizationId: string,
  id: string,
  input: DispatchTransferInput
) =>
  repo.runInTransaction(async (tx) => {
    const transfer = await getTransferOrThrow(organizationId, id, tx);
    ensureStatus(transfer.status, ["ALLOCATED"]);

    for (const item of transfer.items) {
      if (!item.sourceInventoryId || item.allocatedQuantity <= 0) {
        throw new BadRequestError(`Transfer item ${item.product.sku} is not allocated`);
      }

      const result = await repo.dispatchReservedInventory(tx, item.sourceInventoryId, item.allocatedQuantity);
      if (!result) {
        throw new BadRequestError(`Allocated stock is no longer available for dispatch: ${item.product.sku}`);
      }

      const movement = await repo.createInventoryMovement(tx, {
        organizationId,
        inventoryId: item.sourceInventoryId,
        productId: item.productId,
        storeId: transfer.sourceWarehouseId,
        movementType: "TRANSFER_OUT",
        quantityChange: -item.allocatedQuantity,
        previousQuantity: result.before.quantityOnHand,
        newQuantity: result.after.quantityOnHand,
        referenceType: "STOCK_TRANSFER",
        referenceId: transfer.id,
        reason: "WAREHOUSE_TRANSFER_DISPATCH",
        metadata: {
          transferNo: transfer.transferNo,
          destinationStoreId: transfer.destinationStoreId,
          dispatchReference: input.dispatchReference,
          trackingReference: input.trackingReference,
        },
      });

      await repo.updateTransferItemAllocation(tx, item.id, {
        dispatchedQuantity: item.allocatedQuantity,
      });
      await repo.syncLowStockAlert(tx, result.after, movement.id);
    }

    await repo.updateTransferStatus(tx, organizationId, id, {
      status: "DISPATCHED",
      dispatchedAt: new Date(),
      dispatchedByUserId: input.dispatchedByUserId,
      dispatchReference: input.dispatchReference,
      trackingReference: input.trackingReference,
    });

    return getTransferOrThrow(organizationId, id, tx);
  });

export const markInTransit = async (
  organizationId: string,
  id: string
) =>
  repo.runInTransaction(async (tx) => {
    const transfer = await getTransferOrThrow(organizationId, id, tx);
    ensureStatus(transfer.status, ["DISPATCHED"]);

    await repo.updateTransferStatus(tx, organizationId, id, {
      status: "IN_TRANSIT",
      inTransitAt: new Date(),
    });

    return getTransferOrThrow(organizationId, id, tx);
  });

export const confirmDelivery = async (
  organizationId: string,
  id: string,
  input: DeliveryTransferInput
) =>
  repo.runInTransaction(async (tx) => {
    const transfer = await getTransferOrThrow(organizationId, id, tx);
    ensureStatus(transfer.status, ["DISPATCHED", "IN_TRANSIT"]);

    for (const item of transfer.items) {
      const deliveredQuantity = input.deliveredQuantities?.[item.productId] ?? item.dispatchedQuantity;

      if (deliveredQuantity < 0 || deliveredQuantity > item.dispatchedQuantity) {
        throw new BadRequestError(`Delivered quantity is invalid for ${item.product.sku}`);
      }

      const result = await repo.receiveDestinationInventory(
        tx,
        organizationId,
        transfer.destinationStoreId,
        item.productId,
        deliveredQuantity
      );

      const movement = await repo.createInventoryMovement(tx, {
        organizationId,
        inventoryId: result.after.id,
        productId: item.productId,
        storeId: transfer.destinationStoreId,
        movementType: "TRANSFER_IN",
        quantityChange: deliveredQuantity,
        previousQuantity: result.before?.quantityAvailable ?? 0,
        newQuantity: result.after.quantityAvailable,
        referenceType: "STOCK_TRANSFER",
        referenceId: transfer.id,
        reason: "STORE_TRANSFER_DELIVERY",
        metadata: {
          transferNo: transfer.transferNo,
          sourceWarehouseId: transfer.sourceWarehouseId,
          note: input.notes,
        },
      });

      await repo.updateTransferItemAllocation(tx, item.id, {
        deliveredQuantity,
        destinationInventoryId: result.after.id,
      });
      await repo.syncLowStockAlert(tx, result.after, movement.id);
    }

    await repo.updateTransferStatus(tx, organizationId, id, {
      status: "DELIVERED",
      deliveredAt: new Date(),
      deliveredByUserId: input.deliveredByUserId,
      notes: input.notes,
    });

    return getTransferOrThrow(organizationId, id, tx);
  });

export const cancelTransfer = async (
  organizationId: string,
  id: string,
  input: TransferActionInput
) =>
  repo.runInTransaction(async (tx) => {
    const transfer = await getTransferOrThrow(organizationId, id, tx);

    if (terminalTransferStatuses.includes(transfer.status)) {
      throw new BadRequestError("Transfer is already closed");
    }

    if (["DISPATCHED", "IN_TRANSIT"].includes(transfer.status)) {
      throw new BadRequestError("Dispatched transfers cannot be cancelled; confirm delivery or reconcile manually");
    }

    if (transfer.status === "ALLOCATED") {
      for (const item of transfer.items) {
        if (item.sourceInventoryId && item.allocatedQuantity > 0) {
          await repo.releaseReservedWarehouseInventory(tx, item.sourceInventoryId, item.allocatedQuantity);
          await repo.updateTransferItemAllocation(tx, item.id, {
            allocatedQuantity: 0,
          });
        }
      }
    }

    await repo.updateTransferStatus(tx, organizationId, id, {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledByUserId: input.userId,
      cancellationReason: input.reason,
      metadata: input.metadata,
    });

    return getTransferOrThrow(organizationId, id, tx);
  });

export const parseActionInput = (body: Record<string, unknown>): TransferActionInput => ({
  userId: stringValue(body.userId),
  reason: stringValue(body.reason),
  metadata: body.metadata && typeof body.metadata === "object" ? body.metadata as Prisma.InputJsonValue : undefined,
});

export const parseDispatchInput = (body: Record<string, unknown>): DispatchTransferInput => ({
  dispatchedByUserId: stringValue(body.dispatchedByUserId),
  dispatchReference: stringValue(body.dispatchReference),
  trackingReference: stringValue(body.trackingReference),
});

export const parseDeliveryInput = (body: Record<string, unknown>): DeliveryTransferInput => {
  const deliveredQuantities =
    body.deliveredQuantities && typeof body.deliveredQuantities === "object" && !Array.isArray(body.deliveredQuantities)
      ? Object.fromEntries(
          Object.entries(body.deliveredQuantities as Record<string, unknown>).map(([productId, quantity]) => [
            productId,
            parsePositiveInteger(quantity, `deliveredQuantities.${productId}`),
          ])
        )
      : undefined;

  return {
    deliveredByUserId: stringValue(body.deliveredByUserId),
    deliveredQuantities,
    notes: stringValue(body.notes),
  };
};
