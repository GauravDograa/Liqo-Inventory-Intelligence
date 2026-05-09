import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./product.service";

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} is required`);
  }

  return value;
};

const optionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new BadRequestError(`${field} must be a non-negative number`);
  }

  return value;
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await service.createProduct(req.user!.organizationId, {
      sku: requiredString(req.body.sku, "sku"),
      name: requiredString(req.body.name, "name"),
      barcode: typeof req.body.barcode === "string" ? req.body.barcode : undefined,
      description: typeof req.body.description === "string" ? req.body.description : undefined,
      hsnCode: typeof req.body.hsnCode === "string" ? req.body.hsnCode : undefined,
      gstRate: optionalNumber(req.body.gstRate, "gstRate"),
      baseCost: optionalNumber(req.body.baseCost, "baseCost"),
      mrp: optionalNumber(req.body.mrp, "mrp"),
      brandId: typeof req.body.brandId === "string" ? req.body.brandId : undefined,
      categoryId: typeof req.body.categoryId === "string" ? req.body.categoryId : undefined,
    });

    res.status(201).json(ok(product, "Product created"));
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.listProducts(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.getProduct(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
