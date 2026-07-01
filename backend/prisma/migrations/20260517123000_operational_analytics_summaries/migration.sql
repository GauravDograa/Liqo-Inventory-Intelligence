-- Operational analytics synchronization summaries

CREATE TABLE "daily_sales_summary" (
  "id" TEXT NOT NULL,
  "summaryDate" TIMESTAMP(3) NOT NULL,
  "transactionCount" INTEGER NOT NULL DEFAULT 0,
  "itemQuantity" INTEGER NOT NULL DEFAULT 0,
  "grossRevenue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "taxableRevenue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "discountTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "gstTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "averageOrderValue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_sales_summary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_performance_summary" (
  "id" TEXT NOT NULL,
  "summaryDate" TIMESTAMP(3) NOT NULL,
  "storeId" TEXT NOT NULL,
  "transactionCount" INTEGER NOT NULL DEFAULT 0,
  "itemQuantity" INTEGER NOT NULL DEFAULT 0,
  "grossRevenue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "taxableRevenue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "gstTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "averageOrderValue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "store_performance_summary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_health_summary" (
  "id" TEXT NOT NULL,
  "summaryDate" TIMESTAMP(3) NOT NULL,
  "storeId" TEXT,
  "totalProducts" INTEGER NOT NULL DEFAULT 0,
  "totalQuantityOnHand" INTEGER NOT NULL DEFAULT 0,
  "totalQuantityAvailable" INTEGER NOT NULL DEFAULT 0,
  "lowStockCount" INTEGER NOT NULL DEFAULT 0,
  "outOfStockCount" INTEGER NOT NULL DEFAULT 0,
  "overstockCount" INTEGER NOT NULL DEFAULT 0,
  "openLowStockAlerts" INTEGER NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inventory_health_summary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_method_summary" (
  "id" TEXT NOT NULL,
  "summaryDate" TIMESTAMP(3) NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "paymentCount" INTEGER NOT NULL DEFAULT 0,
  "paymentAmount" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_method_summary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gst_summary" (
  "id" TEXT NOT NULL,
  "summaryDate" TIMESTAMP(3) NOT NULL,
  "invoiceCount" INTEGER NOT NULL DEFAULT 0,
  "taxableAmount" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "cgstTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "sgstTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "igstTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "gstTotal" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "gst_summary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_sales_velocity_summary" (
  "id" TEXT NOT NULL,
  "summaryDate" TIMESTAMP(3) NOT NULL,
  "productId" TEXT NOT NULL,
  "storeId" TEXT,
  "unitsSold" INTEGER NOT NULL DEFAULT 0,
  "revenue" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "transactionCount" INTEGER NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_sales_velocity_summary_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_sales_summary_organizationId_summaryDate_key" ON "daily_sales_summary"("organizationId", "summaryDate");
CREATE INDEX "daily_sales_summary_organizationId_summaryDate_idx" ON "daily_sales_summary"("organizationId", "summaryDate");

CREATE UNIQUE INDEX "store_performance_summary_organizationId_storeId_summaryD_key" ON "store_performance_summary"("organizationId", "storeId", "summaryDate");
CREATE INDEX "store_performance_summary_organizationId_summaryDate_idx" ON "store_performance_summary"("organizationId", "summaryDate");
CREATE INDEX "store_performance_summary_organizationId_storeId_summaryDa_idx" ON "store_performance_summary"("organizationId", "storeId", "summaryDate");

CREATE UNIQUE INDEX "inventory_health_summary_organizationId_storeId_summaryDa_key" ON "inventory_health_summary"("organizationId", "storeId", "summaryDate");
CREATE INDEX "inventory_health_summary_organizationId_summaryDate_idx" ON "inventory_health_summary"("organizationId", "summaryDate");
CREATE INDEX "inventory_health_summary_organizationId_storeId_summaryDate_idx" ON "inventory_health_summary"("organizationId", "storeId", "summaryDate");

CREATE UNIQUE INDEX "payment_method_summary_organizationId_paymentMethod_summary_key" ON "payment_method_summary"("organizationId", "paymentMethod", "summaryDate");
CREATE INDEX "payment_method_summary_organizationId_summaryDate_idx" ON "payment_method_summary"("organizationId", "summaryDate");
CREATE INDEX "payment_method_summary_organizationId_paymentMethod_summary_idx" ON "payment_method_summary"("organizationId", "paymentMethod", "summaryDate");

CREATE UNIQUE INDEX "gst_summary_organizationId_summaryDate_key" ON "gst_summary"("organizationId", "summaryDate");
CREATE INDEX "gst_summary_organizationId_summaryDate_idx" ON "gst_summary"("organizationId", "summaryDate");

CREATE UNIQUE INDEX "product_sales_velocity_summary_organizationId_productId_st_key" ON "product_sales_velocity_summary"("organizationId", "productId", "storeId", "summaryDate");
CREATE INDEX "product_sales_velocity_summary_organizationId_summaryDate_idx" ON "product_sales_velocity_summary"("organizationId", "summaryDate");
CREATE INDEX "product_sales_velocity_summary_organizationId_productId_summa_idx" ON "product_sales_velocity_summary"("organizationId", "productId", "summaryDate");
CREATE INDEX "product_sales_velocity_summary_organizationId_storeId_summary_idx" ON "product_sales_velocity_summary"("organizationId", "storeId", "summaryDate");

ALTER TABLE "daily_sales_summary" ADD CONSTRAINT "daily_sales_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_performance_summary" ADD CONSTRAINT "store_performance_summary_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_performance_summary" ADD CONSTRAINT "store_performance_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_health_summary" ADD CONSTRAINT "inventory_health_summary_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_health_summary" ADD CONSTRAINT "inventory_health_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_method_summary" ADD CONSTRAINT "payment_method_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gst_summary" ADD CONSTRAINT "gst_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_sales_velocity_summary" ADD CONSTRAINT "product_sales_velocity_summary_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_sales_velocity_summary" ADD CONSTRAINT "product_sales_velocity_summary_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_sales_velocity_summary" ADD CONSTRAINT "product_sales_velocity_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
