import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./customer.service";

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

const optionalObject = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestError(`${field} must be an object`);
  }

  return value as object;
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await service.createCustomer(req.user!.organizationId, {
      customerNumber: requiredString(req.body.customerNumber, "customerNumber"),
      name: requiredString(req.body.name, "name"),
      email: optionalString(req.body.email),
      phone: optionalString(req.body.phone),
      gstin: optionalString(req.body.gstin),
      billingAddress: optionalObject(req.body.billingAddress, "billingAddress"),
      shippingAddress: optionalObject(req.body.shippingAddress, "shippingAddress"),
    });

    res.status(201).json(ok(customer, "Customer created"));
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.listCustomers(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.getCustomer(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
