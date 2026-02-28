import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./recommendation.service";

export const getRecommendations = async (
  req: AuthRequest,
  res: Response
) => {

  const data =
    await service.generateTransferRecommendations(
      req.user!.organizationId
    );

  res.json({
    success: true,
    data
  });
};