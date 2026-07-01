import { NextFunction, Response } from "express";
import { ok } from "../../../shared/http/api-response";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import * as service from "./recommendation-engine.service";

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

export const generateRecommendations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(202).json(
      ok(
        await service.generateRecommendations(req.user!.organizationId),
        "Recommendations generated"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const listRecommendations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await service.listRecommendations(req.user!.organizationId, {
          status: typeof req.query.status === "string" ? req.query.status : undefined,
          type: typeof req.query.type === "string" ? req.query.type : undefined,
          productId: typeof req.query.productId === "string" ? req.query.productId : undefined,
          storeId: typeof req.query.storeId === "string" ? req.query.storeId : undefined,
        })
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getRecommendation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.getRecommendation(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};

export const recordDecision = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await service.recordDecision(
          req.user!.organizationId,
          routeParam(req.params.id, "id"),
          req.body
        ),
        "Recommendation decision recorded"
      )
    );
  } catch (error) {
    next(error);
  }
};
