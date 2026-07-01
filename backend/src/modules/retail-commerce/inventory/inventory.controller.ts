import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./inventory.service";

const adjustmentReasons = [
  "STOCK_CORRECTION",
  "DAMAGE",
  "SHRINKAGE",
  "RETURN_TO_STOCK",
  "OPENING_BALANCE",
  "CYCLE_COUNT",
] as const;

const adjustmentMovementTypes = ["ADJUSTMENT", "DAMAGE", "RESTOCK", "RETURN"] as const;

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

const optionalInteger = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BadRequestError(`${field} must be a non-negative integer`);
  }

  return value;
};

const requiredInteger = (value: unknown, field: string) => {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new BadRequestError(`${field} must be an integer`);
  }

  return value;
};

const optionalString = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new BadRequestError(`${field} must be a string`);
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const requiredAdjustmentReason = (value: unknown) => {
  const reason = requiredString(value, "reason");
  if (!adjustmentReasons.includes(reason as typeof adjustmentReasons[number])) {
    throw new BadRequestError("reason is invalid");
  }

  return reason as typeof adjustmentReasons[number];
};

const optionalAdjustmentMovementType = (value: unknown) => {
  const movementType = optionalString(value, "movementType");
  if (!movementType) {
    return undefined;
  }

  if (!adjustmentMovementTypes.includes(movementType as typeof adjustmentMovementTypes[number])) {
    throw new BadRequestError("movementType is invalid for inventory adjustment");
  }

  return movementType as typeof adjustmentMovementTypes[number];
};

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} is required`);
  }

  return value;
};

export const upsertInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const inventory = await service.upsertInventory(req.user!.organizationId, {
      productId: requiredString(req.body.productId, "productId"),
      storeId: requiredString(req.body.storeId, "storeId"),
      quantityOnHand: optionalInteger(req.body.quantityOnHand, "quantityOnHand"),
      quantityReserved: optionalInteger(req.body.quantityReserved, "quantityReserved"),
      quantityAvailable: optionalInteger(req.body.quantityAvailable, "quantityAvailable"),
      reorderLevel: optionalInteger(req.body.reorderLevel, "reorderLevel"),
      reorderQuantity: optionalInteger(req.body.reorderQuantity, "reorderQuantity"),
      safetyStockLevel: optionalInteger(req.body.safetyStockLevel, "safetyStockLevel"),
    });

    res.status(201).json(ok(inventory, "Inventory saved"));
  } catch (error) {
    next(error);
  }
};

export const listInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storeId = typeof req.query.storeId === "string" ? req.query.storeId : undefined;
    res.json(ok(await service.listInventory(req.user!.organizationId, storeId)));
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.getInventory(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const inventory = await service.recordInventoryAdjustment({
      organizationId: req.user!.organizationId,
      productId: requiredString(req.body.productId, "productId"),
      storeId: requiredString(req.body.storeId, "storeId"),
      quantityDelta: requiredInteger(req.body.quantityDelta, "quantityDelta"),
      movementType: optionalAdjustmentMovementType(req.body.movementType),
      reason: requiredAdjustmentReason(req.body.reason),
      note: optionalString(req.body.note, "note"),
      adjustedByUserId: optionalString(req.body.adjustedByUserId, "adjustedByUserId"),
      metadata: req.body.metadata,
    });

    res.status(201).json(ok(inventory, "Inventory adjusted"));
  } catch (error) {
    next(error);
  }
};
