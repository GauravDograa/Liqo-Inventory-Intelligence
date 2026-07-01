import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../prisma/client";

export type AuditLogInput = {
  organizationId: string;
  action: string;
  entityType: string;
  entityId?: string;
  severity?: string;
  requestId?: string;
  method?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  userRole?: UserRole;
  storeId?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
};

export const createAuditLog = async (input: AuditLogInput) => {
  try {
    return await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        severity: input.severity ?? "INFO",
        requestId: input.requestId,
        method: input.method,
        path: input.path,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        userId: input.userId,
        userRole: input.userRole,
        storeId: input.storeId,
        before: input.before,
        after: input.after,
        metadata: input.metadata,
      },
    });
  } catch {
    return null;
  }
};

export const listAuditLogs = (
  organizationId: string,
  filters: {
    action?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
  }
) =>
  prisma.auditLog.findMany({
    where: {
      organizationId,
      action: filters.action,
      entityType: filters.entityType,
      entityId: filters.entityId,
      userId: filters.userId,
    },
    orderBy: { createdAt: "desc" },
    take: 250,
  });
