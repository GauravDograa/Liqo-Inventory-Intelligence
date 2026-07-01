import { NextFunction, Response } from "express";
import crypto from "crypto";
import { logger } from "../infrastructure/logger";
import { AuthRequest } from "../types/auth.types";

export const requestLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
  const requestId = req.header("x-request-id") || crypto.randomUUID();
  const start = Date.now();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.userId,
      organizationId: req.user?.organizationId,
      role: req.user?.role,
      ip: req.ip,
    });
  });

  next();
};
