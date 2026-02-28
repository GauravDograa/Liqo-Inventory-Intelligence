import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./deadstock.service";

export const getDeadStockSummary = async (
  req: AuthRequest,
  res: Response
) => {
  const threshold = Number(req.query.threshold || 90);

  const data = await service.getDeadStockSummary(
    req.user!.organizationId,
    threshold
  );

  res.json({
    success: true,
    data
  });
};