import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}