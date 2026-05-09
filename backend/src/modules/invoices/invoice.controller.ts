import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/auth.types";
import { BadRequestError } from "../../shared/errors/http-errors";
import { ok } from "../../shared/http/api-response";
import * as service from "./invoice.service";

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} is required`);
  }

  return value;
};

export const listInvoices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.listInvoices(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.getInvoice(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
