CREATE TYPE "ForecastType" AS ENUM (
  'DEMAND_FORECAST',
  'STOCKOUT_FORECAST',
  'REORDER_FORECAST',
  'FESTIVAL_FORECAST'
);

CREATE TABLE "retail_forecast_model_metadata" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0.0',
  "provider" TEXT NOT NULL DEFAULT 'rule_based',
  "algorithm" TEXT NOT NULL DEFAULT 'moving_average',
  "description" TEXT,
  "parameters" JSONB,
  "metrics" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "retail_forecast_model_metadata_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "retail_forecasts" (
  "id" TEXT NOT NULL,
  "type" "ForecastType" NOT NULL,
  "workflow" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "storeId" TEXT,
  "horizonStart" TIMESTAMP(3) NOT NULL,
  "horizonEnd" TIMESTAMP(3) NOT NULL,
  "horizonDays" INTEGER NOT NULL,
  "predictedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "salesVelocityPerDay" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "movingAveragePerDay" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "trendMultiplier" DECIMAL(8,4) NOT NULL DEFAULT 1,
  "seasonalMultiplier" DECIMAL(8,4) NOT NULL DEFAULT 1,
  "festivalMultiplier" DECIMAL(8,4) NOT NULL DEFAULT 1,
  "confidenceScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "explanation" TEXT NOT NULL,
  "stockoutRisk" DECIMAL(5,2),
  "daysUntilStockout" INTEGER,
  "recommendedReorderQuantity" INTEGER,
  "reorderPoint" INTEGER,
  "currentStock" INTEGER,
  "signals" JSONB,
  "metadata" JSONB,
  "modelMetadataId" TEXT,
  "organizationId" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "retail_forecasts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "retail_forecast_model_metadata_organizationId_name_version_key"
  ON "retail_forecast_model_metadata"("organizationId", "name", "version");
CREATE INDEX "retail_forecast_model_metadata_organizationId_isActive_idx"
  ON "retail_forecast_model_metadata"("organizationId", "isActive");

CREATE INDEX "retail_forecasts_organizationId_type_generatedAt_idx"
  ON "retail_forecasts"("organizationId", "type", "generatedAt");
CREATE INDEX "retail_forecasts_organizationId_productId_generatedAt_idx"
  ON "retail_forecasts"("organizationId", "productId", "generatedAt");
CREATE INDEX "retail_forecasts_organizationId_storeId_generatedAt_idx"
  ON "retail_forecasts"("organizationId", "storeId", "generatedAt");
CREATE INDEX "retail_forecasts_organizationId_workflow_generatedAt_idx"
  ON "retail_forecasts"("organizationId", "workflow", "generatedAt");

ALTER TABLE "retail_forecast_model_metadata"
  ADD CONSTRAINT "retail_forecast_model_metadata_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "retail_forecasts"
  ADD CONSTRAINT "retail_forecasts_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "retail_products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "retail_forecasts"
  ADD CONSTRAINT "retail_forecasts_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "retail_stores"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "retail_forecasts"
  ADD CONSTRAINT "retail_forecasts_modelMetadataId_fkey"
  FOREIGN KEY ("modelMetadataId") REFERENCES "retail_forecast_model_metadata"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "retail_forecasts"
  ADD CONSTRAINT "retail_forecasts_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
