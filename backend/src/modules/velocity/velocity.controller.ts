import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./velocity.service";

export const getVelocity = async (
  req: AuthRequest,
  res: Response
) => {

  const days = Number(req.query.days || 30);
  const storeId = req.query.storeId as string | undefined;

  const data = await service.getVelocity(
    req.user!.organizationId,
    days,
    storeId
  );

  res.json({
    success: true,
    data
  });
};