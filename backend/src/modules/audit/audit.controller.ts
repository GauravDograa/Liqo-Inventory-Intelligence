import { NextFunction, Response } from "express";
import { ok } from "../../shared/http/api-response";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./audit.service";

export const listAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await service.listAuditLogs(req.user!.organizationId, {
          action: typeof req.query.action === "string" ? req.query.action : undefined,
          entityType: typeof req.query.entityType === "string" ? req.query.entityType : undefined,
          entityId: typeof req.query.entityId === "string" ? req.query.entityId : undefined,
          userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
        })
      )
    );
  } catch (error) {
    next(error);
  }
};
