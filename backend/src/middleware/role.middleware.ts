import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { UserRole } from "@prisma/client";

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};