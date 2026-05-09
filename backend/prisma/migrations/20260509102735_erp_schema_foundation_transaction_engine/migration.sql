-- CreateEnum
CREATE TYPE "RetailEntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISCONTINUED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RetailTransactionStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PARTIALLY_RETURNED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'STORE_CREDIT', 'GIFT_CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'VOID', 'CANCELLED');

-- CreateTable
CREATE TABLE "retail_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "RetailEntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "RetailEntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "parentId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hsnCode" TEXT,
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "baseCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "mrp" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "brandId" TEXT,
    "categoryId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_stores" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "region" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "status" "RetailEntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "quantityAvailable" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
    "safetyStockLevel" INTEGER NOT NULL DEFAULT 0,
    "lastStocktakeAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_customers" (
    "id" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "gstin" TEXT,
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "status" "RetailEntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_transactions" (
    "id" TEXT NOT NULL,
    "transactionNo" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RetailTransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_transaction_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cgstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "transactionId" TEXT NOT NULL,
    "customerId" TEXT,
    "gstin" TEXT,
    "placeOfSupply" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retail_payments" (
    "id" TEXT NOT NULL,
    "paymentNo" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(14,2) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "referenceNo" TEXT,
    "transactionId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retail_brands_organizationId_status_idx" ON "retail_brands"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "retail_brands_organizationId_name_key" ON "retail_brands"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "retail_brands_organizationId_code_key" ON "retail_brands"("organizationId", "code");

-- CreateIndex
CREATE INDEX "retail_categories_organizationId_parentId_idx" ON "retail_categories"("organizationId", "parentId");

-- CreateIndex
CREATE INDEX "retail_categories_organizationId_status_idx" ON "retail_categories"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "retail_categories_organizationId_name_key" ON "retail_categories"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "retail_categories_organizationId_code_key" ON "retail_categories"("organizationId", "code");

-- CreateIndex
CREATE INDEX "retail_products_organizationId_status_idx" ON "retail_products"("organizationId", "status");

-- CreateIndex
CREATE INDEX "retail_products_organizationId_brandId_idx" ON "retail_products"("organizationId", "brandId");

-- CreateIndex
CREATE INDEX "retail_products_organizationId_categoryId_idx" ON "retail_products"("organizationId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "retail_products_organizationId_sku_key" ON "retail_products"("organizationId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "retail_products_organizationId_barcode_key" ON "retail_products"("organizationId", "barcode");

-- CreateIndex
CREATE INDEX "retail_stores_organizationId_status_idx" ON "retail_stores"("organizationId", "status");

-- CreateIndex
CREATE INDEX "retail_stores_organizationId_city_idx" ON "retail_stores"("organizationId", "city");

-- CreateIndex
CREATE UNIQUE INDEX "retail_stores_organizationId_code_key" ON "retail_stores"("organizationId", "code");

-- CreateIndex
CREATE INDEX "retail_inventory_organizationId_productId_idx" ON "retail_inventory"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "retail_inventory_organizationId_storeId_idx" ON "retail_inventory"("organizationId", "storeId");

-- CreateIndex
CREATE INDEX "retail_inventory_organizationId_quantityAvailable_idx" ON "retail_inventory"("organizationId", "quantityAvailable");

-- CreateIndex
CREATE INDEX "retail_inventory_organizationId_storeId_quantityAvailable_idx" ON "retail_inventory"("organizationId", "storeId", "quantityAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "retail_inventory_productId_storeId_key" ON "retail_inventory"("productId", "storeId");

-- CreateIndex
CREATE INDEX "retail_customers_organizationId_status_idx" ON "retail_customers"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "retail_customers_organizationId_customerNumber_key" ON "retail_customers"("organizationId", "customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "retail_customers_organizationId_email_key" ON "retail_customers"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "retail_customers_organizationId_phone_key" ON "retail_customers"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "retail_transactions_organizationId_transactionDate_idx" ON "retail_transactions"("organizationId", "transactionDate");

-- CreateIndex
CREATE INDEX "retail_transactions_organizationId_storeId_transactionDate_idx" ON "retail_transactions"("organizationId", "storeId", "transactionDate");

-- CreateIndex
CREATE INDEX "retail_transactions_organizationId_customerId_idx" ON "retail_transactions"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "retail_transactions_organizationId_status_idx" ON "retail_transactions"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "retail_transactions_organizationId_transactionNo_key" ON "retail_transactions"("organizationId", "transactionNo");

-- CreateIndex
CREATE INDEX "retail_transaction_items_transactionId_idx" ON "retail_transaction_items"("transactionId");

-- CreateIndex
CREATE INDEX "retail_transaction_items_productId_idx" ON "retail_transaction_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "retail_invoices_transactionId_key" ON "retail_invoices"("transactionId");

-- CreateIndex
CREATE INDEX "retail_invoices_organizationId_invoiceDate_idx" ON "retail_invoices"("organizationId", "invoiceDate");

-- CreateIndex
CREATE INDEX "retail_invoices_organizationId_status_idx" ON "retail_invoices"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "retail_invoices_organizationId_invoiceNo_key" ON "retail_invoices"("organizationId", "invoiceNo");

-- CreateIndex
CREATE INDEX "retail_payments_organizationId_method_idx" ON "retail_payments"("organizationId", "method");

-- CreateIndex
CREATE INDEX "retail_payments_organizationId_status_idx" ON "retail_payments"("organizationId", "status");

-- CreateIndex
CREATE INDEX "retail_payments_organizationId_paidAt_idx" ON "retail_payments"("organizationId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "retail_payments_organizationId_paymentNo_key" ON "retail_payments"("organizationId", "paymentNo");

-- AddForeignKey
ALTER TABLE "retail_brands" ADD CONSTRAINT "retail_brands_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_categories" ADD CONSTRAINT "retail_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "retail_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_categories" ADD CONSTRAINT "retail_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_products" ADD CONSTRAINT "retail_products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "retail_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_products" ADD CONSTRAINT "retail_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "retail_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_products" ADD CONSTRAINT "retail_products_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_stores" ADD CONSTRAINT "retail_stores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory" ADD CONSTRAINT "retail_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory" ADD CONSTRAINT "retail_inventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_inventory" ADD CONSTRAINT "retail_inventory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_customers" ADD CONSTRAINT "retail_customers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_transactions" ADD CONSTRAINT "retail_transactions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_transactions" ADD CONSTRAINT "retail_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "retail_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_transactions" ADD CONSTRAINT "retail_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_transaction_items" ADD CONSTRAINT "retail_transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "retail_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_transaction_items" ADD CONSTRAINT "retail_transaction_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_invoices" ADD CONSTRAINT "retail_invoices_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "retail_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_invoices" ADD CONSTRAINT "retail_invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "retail_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_invoices" ADD CONSTRAINT "retail_invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_payments" ADD CONSTRAINT "retail_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "retail_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_payments" ADD CONSTRAINT "retail_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "retail_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retail_payments" ADD CONSTRAINT "retail_payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
