import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as inventoryService from "./inventory.service";

export const getInventory = async (
  req: AuthRequest,
  res: Response
) => {
  const organizationId = req.user!.organizationId;

  const data = await inventoryService.getInventory(organizationId);

  res.json({
    success: true,
    data,
  });
};