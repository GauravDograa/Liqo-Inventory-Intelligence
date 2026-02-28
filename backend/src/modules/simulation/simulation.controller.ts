import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./simulation.service";

export const runSimulation = async (
  req: AuthRequest,
  res: Response
) => {

  const result =
    await service.runSimulation(
      req.user!.organizationId
    );

  res.json({
    success: true,
    data: result
  });
};