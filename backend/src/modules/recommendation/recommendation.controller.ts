import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import { getCachedRecommendations } from "./recommendation.cache";

export const getRecommendations = async (
  req: AuthRequest,
  res: Response
) => {
  const data = await getCachedRecommendations(
    req.user!.organizationId
  );

  res.json({
    success: true,
    data
  });
};
