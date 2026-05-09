import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/auth.types";
import { BadRequestError } from "../../shared/errors/http-errors";
import { ok } from "../../shared/http/api-response";
import * as service from "./payment.service";

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} is required`);
  }

  return value;
};

export const listPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.listPayments(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.getPayment(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
