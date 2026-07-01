import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./store.service";

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

const optionalString = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const optionalLocationType = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value !== "STORE" && value !== "WAREHOUSE") {
    throw new BadRequestError("locationType must be STORE or WAREHOUSE");
  }

  return value;
};

export const createStore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const store = await service.createStore(req.user!.organizationId, {
      code: requiredString(req.body.code, "code"),
      name: requiredString(req.body.name, "name"),
      gstin: optionalString(req.body.gstin),
      region: optionalString(req.body.region),
      city: optionalString(req.body.city),
      state: optionalString(req.body.state),
      country: optionalString(req.body.country),
      locationType: optionalLocationType(req.body.locationType),
    });

    res.status(201).json(ok(store, "Store created"));
  } catch (error) {
    next(error);
  }
};

export const listStores = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.listStores(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getStore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.getStore(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
