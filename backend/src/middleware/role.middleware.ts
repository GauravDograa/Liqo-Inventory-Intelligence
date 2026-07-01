import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { UserRole } from "@prisma/client";
import { ForbiddenError } from "../shared/errors/http-errors";

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== "OWNER")) {
      return next(new ForbiddenError("Forbidden"));
    }
    next();
  };
};

export type Permission =
  | "catalog:read"
  | "catalog:write"
  | "inventory:read"
  | "inventory:write"
  | "transactions:read"
  | "transactions:write"
  | "billing:read"
  | "billing:write"
  | "warehouse:read"
  | "warehouse:write"
  | "analytics:read"
  | "analytics:write"
  | "audit:read";

const rolePermissions: Record<UserRole, Permission[]> = {
  OWNER: [
    "catalog:read", "catalog:write", "inventory:read", "inventory:write",
    "transactions:read", "transactions:write", "billing:read", "billing:write",
    "warehouse:read", "warehouse:write", "analytics:read", "analytics:write", "audit:read",
  ],
  ADMIN: [
    "catalog:read", "catalog:write", "inventory:read", "inventory:write",
    "transactions:read", "transactions:write", "billing:read", "billing:write",
    "warehouse:read", "warehouse:write", "analytics:read", "analytics:write", "audit:read",
  ],
  STORE_MANAGER: [
    "catalog:read", "inventory:read", "inventory:write", "transactions:read",
    "transactions:write", "billing:read", "warehouse:read", "analytics:read",
  ],
  CASHIER: ["catalog:read", "inventory:read", "transactions:read", "transactions:write", "billing:read", "billing:write"],
  WAREHOUSE_MANAGER: ["catalog:read", "inventory:read", "inventory:write", "warehouse:read", "warehouse:write"],
  ANALYST: ["catalog:read", "inventory:read", "transactions:read", "billing:read", "analytics:read"],
  USER: ["catalog:read", "inventory:read", "transactions:read", "billing:read", "warehouse:read", "analytics:read"],
};

export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !rolePermissions[req.user.role]?.includes(permission)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    next();
  };
};

const scopedStoreFields = [
  "storeId",
  "destinationStoreId",
  "sourceStoreId",
  "assignedRetailStoreId",
];

export const enforceStoreScope = (options: { allowWarehouseSource?: boolean } = {}) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "STORE_MANAGER") {
      return next();
    }

    const assignedStoreId = req.user.assignedRetailStoreId;
    if (!assignedStoreId) {
      return next(new ForbiddenError("Store manager is not assigned to a store"));
    }

    const candidates = [
      ...scopedStoreFields.map((field) => req.params[field] ?? req.query[field] ?? req.body?.[field]),
    ].filter((value): value is string => typeof value === "string" && value.trim() !== "");

    const relevantCandidates = options.allowWarehouseSource
      ? candidates.filter((candidate) => candidate !== req.body?.sourceWarehouseId)
      : candidates;

    if (relevantCandidates.length === 0 && req.method === "GET") {
      (req.query as Record<string, unknown>).storeId = assignedStoreId;
    }

    if (relevantCandidates.some((storeId) => storeId !== assignedStoreId)) {
      return next(new ForbiddenError("Store managers can only access their assigned store"));
    }

    next();
  };
};

export const enterpriseRoles = rolePermissions;
