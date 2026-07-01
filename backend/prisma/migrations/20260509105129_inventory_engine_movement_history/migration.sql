-- CreateEnum
CREATE TYPE "RetailInventoryMovementType" AS ENUM ('SALE', 'ADJUSTMENT', 'RETURN', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "RetailInventoryAdjustmentReason" AS ENUM ('STOCK_CORRECTION', 'DAMAGE', 'SHRINKAGE', 'RETURN_TO_STOCK', 'OPENING_BALANCE', 'CYCLE_COUNT');

-- CreateTable
CREATE TABLE "retail_inventory_movements" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "movementType" "RetailInventoryMovementType" NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_inventory_adjustment_logs" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "reason" "RetailInventoryAdjustmentReason" NOT NULL,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "note" TEXT,
    "adjustedByUserId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_inventory_adjustment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retail_inventory_movements_organizationId_storeId_createdAt_idx" ON "retail_inventory_movements"("organizationId", "storeId", "createdAt");

-- CreateIndex
CREATE INDEX "retail_inventory_movements_organizationId_productId_created_idx" ON "retail_inventory_movements"("organizationId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "retail_inventory_movements_organizationId_movementType_crea_idx" ON "retail_inventory_movements"("organizationId", "movementType", "createdAt");

-- CreateIndex
CREATE INDEX "retail_inventory_movements_referenceType_referenceId_idx" ON "retail_inventory_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "retail_inventory_adjustment_logs_organizationId_storeId_cre_idx" ON "retail_inventory_adjustment_logs"("organizationId", "storeId", "createdAt");

-- CreateIndex
CREATE INDEX "retail_inventory_adjustment_logs_organizationId_productId_c_idx" ON "retail_inventory_adjustment_logs"("organizationId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "retail_inventory_adjustment_logs_organizationId_reason_crea_idx" ON "retail_inventory_adjustment_logs"("organizationId", "reason", "createdAt");

-- AddForeignKey
ALTER TABLE "retail_inventory_movements" ADD CONSTRAINT "retail_inventory_movements_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "retail_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_movements" ADD CONSTRAINT "retail_inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_movements" ADD CONSTRAINT "retail_inventory_movements_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_movements" ADD CONSTRAINT "retail_inventory_movements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_adjustment_logs" ADD CONSTRAINT "retail_inventory_adjustment_logs_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "retail_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_adjustment_logs" ADD CONSTRAINT "retail_inventory_adjustment_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_adjustment_logs" ADD CONSTRAINT "retail_inventory_adjustment_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory_adjustment_logs" ADD CONSTRAINT "retail_inventory_adjustment_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
