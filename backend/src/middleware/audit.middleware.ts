import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import * as auditService from "../modules/audit/audit.service";

export const auditAction = (input: {
  action: string;
  entityType: string;
  severity?: "INFO" | "WARN" | "CRITICAL";
  storeIdFrom?: "body.storeId" | "body.destinationStoreId" | "query.storeId" | "params.storeId";
}) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      if (!req.user || res.statusCode >= 400 || !["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        return;
      }

      const storeId = resolveStoreId(req, input.storeIdFrom);
      void auditService.createAuditLog({
        organizationId: req.user.organizationId,
        action: input.action,
        entityType: input.entityType,
        entityId: typeof req.params.id === "string" ? req.params.id : undefined,
        severity: input.severity ?? "INFO",
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        ipAddress: req.ip,
        userAgent: req.header("user-agent"),
        userId: req.user.userId,
        userRole: req.user.role,
        storeId,
        metadata: {
          params: req.params,
          query: req.query,
        },
      });
    });

    next();
  };
};

const resolveStoreId = (req: AuthRequest, selector?: string) => {
  if (!selector) {
    return req.user?.assignedRetailStoreId ?? undefined;
  }

  const [source, field] = selector.split(".");
  const value = (req as any)[source]?.[field];

  return typeof value === "string" ? value : req.user?.assignedRetailStoreId ?? undefined;
};
