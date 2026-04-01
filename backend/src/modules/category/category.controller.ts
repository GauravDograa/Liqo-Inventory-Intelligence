import { Response, NextFunction } from "express";
import * as service from "./category.service";
import serializeBigInt from "../../utils/serializer";
import { AuthRequest } from "../../types/auth.types";

export const getCategoryPerformance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { start, end } = req.query as {
      start?: string;
      end?: string;
    };

    const data = await service.getCategoryPerformance(
      req.user!.organizationId,
      start,
      end
    );

    res.json({
      success: true,
      data: serializeBigInt(data),
    });
  } catch (err) {
    next(err);
  }
};
