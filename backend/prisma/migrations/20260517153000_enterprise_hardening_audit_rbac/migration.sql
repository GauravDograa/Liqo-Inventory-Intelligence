ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STORE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CASHIER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'WAREHOUSE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ANALYST';

ALTER TABLE "User"
  ADD COLUMN "assignedRetailStoreId" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "retail_products" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "retail_stores" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "retail_inventory" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "retail_stock_transfers" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE TABLE "retail_audit_logs" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'INFO',
  "requestId" TEXT,
  "method" TEXT,
  "path" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT,
  "userRole" "UserRole",
  "storeId" TEXT,
  "before" JSONB,
  "after" JSONB,
  "metadata" JSONB,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "retail_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "User_organizationId_role_idx" ON "User"("organizationId", "role");
CREATE INDEX "User_organizationId_assignedRetailStoreId_idx" ON "User"("organizationId", "assignedRetailStoreId");
CREATE INDEX "retail_audit_logs_organizationId_createdAt_idx" ON "retail_audit_logs"("organizationId", "createdAt");
CREATE INDEX "retail_audit_logs_organizationId_action_createdAt_idx" ON "retail_audit_logs"("organizationId", "action", "createdAt");
CREATE INDEX "retail_audit_logs_organizationId_entityType_entityId_idx" ON "retail_audit_logs"("organizationId", "entityType", "entityId");
CREATE INDEX "retail_audit_logs_organizationId_userId_createdAt_idx" ON "retail_audit_logs"("organizationId", "userId", "createdAt");

ALTER TABLE "User"
  ADD CONSTRAINT "User_assignedRetailStoreId_fkey"
  FOREIGN KEY ("assignedRetailStoreId") REFERENCES "retail_stores"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "retail_audit_logs"
  ADD CONSTRAINT "retail_audit_logs_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
