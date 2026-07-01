-- Invoice and Financial Engine lifecycle support

-- AlterTable
ALTER TABLE "retail_invoices"
  ADD COLUMN "storeId" TEXT,
  ADD COLUMN "financialYear" INTEGER,
  ADD COLUMN "sequenceNumber" INTEGER,
  ADD COLUMN "pdfPath" TEXT,
  ADD COLUMN "pdfGeneratedAt" TIMESTAMP(3),
  ADD COLUMN "paymentReconciledAt" TIMESTAMP(3),
  ADD COLUMN "auditTrail" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "retail_invoices_organizationId_storeId_financialYear_sequenceN_key"
ON "retail_invoices"("organizationId", "storeId", "financialYear", "sequenceNumber");

CREATE INDEX "retail_invoices_organizationId_storeId_financialYear_idx"
ON "retail_invoices"("organizationId", "storeId", "financialYear");

-- AddForeignKey
ALTER TABLE "retail_invoices"
ADD CONSTRAINT "retail_invoices_storeId_fkey"
FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
