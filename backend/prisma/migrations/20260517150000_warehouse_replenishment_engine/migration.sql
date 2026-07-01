CREATE TYPE "RetailLocationType" AS ENUM ('STORE', 'WAREHOUSE');

CREATE TYPE "StockTransferStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'ALLOCATED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
);

ALTER TABLE "retail_stores"
  ADD COLUMN "locationType" "RetailLocationType" NOT NULL DEFAULT 'STORE';

CREATE TABLE "retail_stock_transfers" (
  "id" TEXT NOT NULL,
  "transferNo" TEXT NOT NULL,
  "status" "StockTransferStatus" NOT NULL DEFAULT 'PENDING',
  "sourceWarehouseId" TEXT NOT NULL,
  "destinationStoreId" TEXT NOT NULL,
  "requestedByUserId" TEXT,
  "approvedByUserId" TEXT,
  "allocatedByUserId" TEXT,
  "dispatchedByUserId" TEXT,
  "deliveredByUserId" TEXT,
  "cancelledByUserId" TEXT,
  "dispatchReference" TEXT,
  "trackingReference" TEXT,
  "expectedDispatchAt" TIMESTAMP(3),
  "expectedDeliveryAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "allocatedAt" TIMESTAMP(3),
  "dispatchedAt" TIMESTAMP(3),
  "inTransitAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "cancellationReason" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "retail_stock_transfers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "retail_transfer_items" (
  "id" TEXT NOT NULL,
  "transferId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "requestedQuantity" INTEGER NOT NULL,
  "allocatedQuantity" INTEGER NOT NULL DEFAULT 0,
  "dispatchedQuantity" INTEGER NOT NULL DEFAULT 0,
  "deliveredQuantity" INTEGER NOT NULL DEFAULT 0,
  "sourceInventoryId" TEXT,
  "destinationInventoryId" TEXT,
  "suggestionSource" TEXT,
  "signals" JSONB,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "retail_transfer_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "retail_stores_organizationId_locationType_status_idx"
  ON "retail_stores"("organizationId", "locationType", "status");

CREATE UNIQUE INDEX "retail_stock_transfers_organizationId_transferNo_key"
  ON "retail_stock_transfers"("organizationId", "transferNo");
CREATE INDEX "retail_stock_transfers_organizationId_status_createdAt_idx"
  ON "retail_stock_transfers"("organizationId", "status", "createdAt");
CREATE INDEX "retail_stock_transfers_organizationId_sourceWarehouseId_status_idx"
  ON "retail_stock_transfers"("organizationId", "sourceWarehouseId", "status");
CREATE INDEX "retail_stock_transfers_organizationId_destinationStoreId_status_idx"
  ON "retail_stock_transfers"("organizationId", "destinationStoreId", "status");

CREATE UNIQUE INDEX "retail_transfer_items_transferId_productId_key"
  ON "retail_transfer_items"("transferId", "productId");
CREATE INDEX "retail_transfer_items_organizationId_productId_idx"
  ON "retail_transfer_items"("organizationId", "productId");
CREATE INDEX "retail_transfer_items_organizationId_transferId_idx"
  ON "retail_transfer_items"("organizationId", "transferId");

ALTER TABLE "retail_stock_transfers"
  ADD CONSTRAINT "retail_stock_transfers_sourceWarehouseId_fkey"
  FOREIGN KEY ("sourceWarehouseId") REFERENCES "retail_stores"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "retail_stock_transfers"
  ADD CONSTRAINT "retail_stock_transfers_destinationStoreId_fkey"
  FOREIGN KEY ("destinationStoreId") REFERENCES "retail_stores"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "retail_stock_transfers"
  ADD CONSTRAINT "retail_stock_transfers_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "retail_transfer_items"
  ADD CONSTRAINT "retail_transfer_items_transferId_fkey"
  FOREIGN KEY ("transferId") REFERENCES "retail_stock_transfers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "retail_transfer_items"
  ADD CONSTRAINT "retail_transfer_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "retail_products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "retail_transfer_items"
  ADD CONSTRAINT "retail_transfer_items_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
