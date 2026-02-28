import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./sku.service";

export const getSkuPerformance = async (
  req: AuthRequest,
  res: Response
) => {

  const data = await service.getSkuPerformance(
    req.user!.organizationId
  );

  res.json({
    success: true,
    data
  });
};