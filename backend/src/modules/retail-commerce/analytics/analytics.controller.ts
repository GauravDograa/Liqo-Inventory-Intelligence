import { NextFunction, Response } from "express";
import { ok } from "../../../shared/http/api-response";
import { AuthRequest } from "../../../types/auth.types";
import * as service from "./analytics.service";

export const syncAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await service.syncOperationalAnalyticsForDate(
      req.user!.organizationId,
      typeof req.body.date === "string" ? req.body.date : undefined
    );

    res.status(202).json(ok(summary, "Analytics synchronized"));
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;

    res.json(
      ok(
        await service.getDashboardSummary(req.user!.organizationId, {
          startDate,
          endDate,
        })
      )
    );
  } catch (error) {
    next(error);
  }
};
