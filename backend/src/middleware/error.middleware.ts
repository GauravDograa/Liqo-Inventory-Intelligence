import { Request, Response, NextFunction } from "express";
import { logger } from "../observability/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Unhandled application error", {
    message: err?.message || "Unknown error",
    stack: err?.stack,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
