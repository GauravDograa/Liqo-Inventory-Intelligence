import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/errors/http-errors";

export const enforceApiVersion = (req: Request, _res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api/") && !req.path.startsWith("/api/v2/")) {
    return next(new BadRequestError("Unsupported API version. Use /api/v2."));
  }

  next();
};
