import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { logger } from "../infrastructure/logger";
import { isAppError } from "../shared/errors/app-error";
import { fail } from "../shared/http/api-response";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = isAppError(err) ? err.statusCode : 500;
  const errorCode = isAppError(err) ? err.code : "INTERNAL_SERVER_ERROR";
  const message =
    isAppError(err) || config.isDevelopment
      ? err.message || "Internal Server Error"
      : "Internal Server Error";

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorCode,
    message: err.message,
    stack: config.isDevelopment ? err.stack : undefined,
  });

  res
    .status(statusCode)
    .json(fail(errorCode, message, isAppError(err) ? err.details : undefined));
};
