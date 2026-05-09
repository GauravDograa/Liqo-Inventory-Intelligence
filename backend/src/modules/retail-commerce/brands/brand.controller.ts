import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./brand.service";

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

export const createBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const brand = await service.createBrand(req.user!.organizationId, {
      name: requiredString(req.body.name, "name"),
      code: typeof req.body.code === "string" ? req.body.code.trim() : undefined,
    });

    res.status(201).json(ok(brand, "Brand created"));
  } catch (error) {
    next(error);
  }
};

export const listBrands = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.listBrands(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.getBrand(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
