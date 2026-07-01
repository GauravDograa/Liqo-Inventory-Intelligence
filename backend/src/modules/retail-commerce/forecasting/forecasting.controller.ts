import { NextFunction, Response } from "express";
import { ok } from "../../../shared/http/api-response";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { AuthRequest } from "../../../types/auth.types";
import * as service from "./forecasting.service";

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

export const generateForecasts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(202).json(
      ok(
        await service.generateForecasts(req.user!.organizationId, req.body ?? {}),
        "Forecasts generated"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const listForecasts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await service.listForecasts(req.user!.organizationId, {
          type: req.query.type,
          workflow: req.query.workflow,
          productId: req.query.productId,
          storeId: req.query.storeId,
        })
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getForecast = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.getForecast(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};

export const getRecommendationSignals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await service.getRecommendationForecastSignals(
          req.user!.organizationId,
          typeof req.query.storeId === "string" ? req.query.storeId : undefined
        )
      )
    );
  } catch (error) {
    next(error);
  }
};
