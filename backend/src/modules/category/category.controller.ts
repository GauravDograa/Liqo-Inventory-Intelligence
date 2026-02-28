import { Request, Response, NextFunction } from "express";
import * as service from "./category.service";
import serializeBigInt from "../../utils/serializer";

export const getCategoryPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { start, end } = req.query as {
      start?: string;
      end?: string;
    };

    const data = await service.getCategoryPerformance(start, end);

    res.json({
      success: true,
      data: serializeBigInt(data),
    });
  } catch (err) {
    next(err);
  }
};