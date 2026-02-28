import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./insights.service";

export const getOverviewInsights = async (
  req: AuthRequest,
  res: Response
) => {
  const { start, end } = req.query;

  const data = await service.generateOverviewInsights(
    req.user!.organizationId,
    start as string,
    end as string
  );

  res.json({
    success: true,
    data
  });
};