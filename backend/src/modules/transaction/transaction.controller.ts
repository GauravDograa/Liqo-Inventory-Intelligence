import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./transaction.service";

export const getTransactions = async (
  req: AuthRequest,
  res: Response
) => {

  const storeId = req.query.storeId as string | undefined;

  const data = await service.getTransactions(
    req.user!.organizationId,
    storeId
  );

  res.json({
    success: true,
    data
  });
};