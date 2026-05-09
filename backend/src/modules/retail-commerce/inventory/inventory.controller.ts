import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./inventory.service";

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
