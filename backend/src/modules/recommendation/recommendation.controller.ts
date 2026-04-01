import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./recommendation.service";

export const getRecommendations = async (
  req: AuthRequest,
  res: Response
) => {

  const data =
    await service.generateTransferRecommendations(
      req.user!.organizationId,
      typeof req.query.provider === "string"
        ? (req.query.provider as any)
        : undefined,
      typeof req.query.modelName === "string"
        ? req.query.modelName
        : undefined
    );

  res.json({
    success: true,
    data
  });
};
