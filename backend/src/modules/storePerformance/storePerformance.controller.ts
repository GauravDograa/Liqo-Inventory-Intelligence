import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./storePerformance.service";

export const getPerformance = async (
  req: AuthRequest,
  res: Response
) => {
  const data = await service.getPerformance(
    req.user!.organizationId
  );

  res.json({
    success: true,
    data
  });
};