import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
  assignedRetailStoreId?: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  requestId?: string;
}
