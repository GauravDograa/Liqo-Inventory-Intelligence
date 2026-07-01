-- Inventory Engine lifecycle integrity
-- Converts the first-pass movement ledger into the production InventoryMovement model
-- and adds persistent low-stock alerts.

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('SALE', 'PURCHASE', 'RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'DAMAGE', 'RESTOCK');

-- CreateEnum
CREATE TYPE "LowStockAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- DropForeignKey
ALTER TABLE "retail_inventory_adjustment_logs" DROP CONSTRAINT IF EXISTS "retail_inventory_adjustment_logs_inventoryId_fkey";
ALTER TABLE "retail_inventory_adjustment_logs" DROP CONSTRAINT IF EXISTS "retail_inventory_adjustment_logs_organizationId_fkey";
ALTER TABLE "retail_inventory_adjustment_logs" DROP CONSTRAINT IF EXISTS "retail_inventory_adjustment_logs_productId_fkey";
ALTER TABLE "retail_inventory_adjustment_logs" DROP CONSTRAINT IF EXISTS "retail_inventory_adjustment_logs_storeId_fkey";

-- Alter movement ledger without losing existing movement history.
ALTER TABLE "retail_inventory_movements"
  RENAME COLUMN "quantityDelta" TO "quantityChange";

ALTER TABLE "retail_inventory_movements"
  RENAME COLUMN "quantityBefore" TO "previousQuantity";

ALTER TABLE "retail_inventory_movements"
  RENAME COLUMN "quantityAfter" TO "newQuantity";

ALTER TABLE "retail_inventory_movements"
  ADD COLUMN "transactionId" TEXT;

ALTER TABLE "retail_inventory_movements"
  ALTER COLUMN "movementType" TYPE "InventoryMovementType"
  USING "movementType"::text::"InventoryMovementType";

-- DropTable
DROP TABLE IF EXISTS "retail_inventory_adjustment_logs";

-- DropEnum
DROP TYPE IF EXISTS "RetailInventoryAdjustmentReason";
DROP TYPE IF EXISTS "RetailInventoryMovementType";

-- CreateTable
CREATE TABLE "retail_low_stock_alerts" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "quantityAvailable" INTEGER NOT NULL,
    "reorderLevel" INTEGER NOT NULL,
    "reorderQuantity" INTEGER NOT NULL,
    "status" "LowStockAlertStatus" NOT NULL DEFAULT 'OPEN',
    "referenceMovementId" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_low_stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retail_low_stock_alerts_organizationId_status_triggeredAt_idx" ON "retail_low_stock_alerts"("organizationId", "status", "triggeredAt");
CREATE INDEX "retail_low_stock_alerts_organizationId_storeId_status_idx" ON "retail_low_stock_alerts"("organizationId", "storeId", "status");
CREATE INDEX "retail_low_stock_alerts_organizationId_productId_status_idx" ON "retail_low_stock_alerts"("organizationId", "productId", "status");
CREATE INDEX "retail_low_stock_alerts_inventoryId_status_idx" ON "retail_low_stock_alerts"("inventoryId", "status");
CREATE INDEX "retail_inventory_movements_transactionId_idx" ON "retail_inventory_movements"("transactionId");

-- AddForeignKey
ALTER TABLE "retail_inventory_movements" ADD CONSTRAINT "retail_inventory_movements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "retail_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "retail_low_stock_alerts" ADD CONSTRAINT "retail_low_stock_alerts_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "retail_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "retail_low_stock_alerts" ADD CONSTRAINT "retail_low_stock_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "retail_low_stock_alerts" ADD CONSTRAINT "retail_low_stock_alerts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "retail_low_stock_alerts" ADD CONSTRAINT "retail_low_stock_alerts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
