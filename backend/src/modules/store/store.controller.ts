import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./store.service";

export const getStorePerformance = async (
  req: AuthRequest,
  res: Response
) => {

  const data = await service.getStorePerformance(
    req.user!.organizationId
  );

  res.json({
    success: true,
    data
  });
};