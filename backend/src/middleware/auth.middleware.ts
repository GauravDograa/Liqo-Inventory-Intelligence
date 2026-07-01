import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { AuthRequest, JwtPayload } from "../types/auth.types";
import { UnauthorizedError } from "../shared/errors/http-errors";

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  const jwtSecret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "liqo-local-dev-secret"
      : undefined);

  if (!token) {
    return next(new UnauthorizedError("Unauthorized"));
  }

  try {
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid token"));
  }
};
