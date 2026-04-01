import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./simulation.service";

export const runSimulation = async (
  req: AuthRequest,
  res: Response
) => {

  const result =
    await service.runSimulation(
      req.user!.organizationId,
      undefined,
      typeof req.query.provider === "string"
        ? (req.query.provider as any)
        : undefined,
      typeof req.query.modelName === "string"
        ? req.query.modelName
        : undefined
    );

  res.json({
    success: true,
    data: result
  });
};

export const compareModels = async (
  req: AuthRequest,
  res: Response
) => {
  const result =
    await service.runSimulationComparison(
      req.user!.organizationId
    );

  res.json({
    success: true,
    data: result,
  });
};
