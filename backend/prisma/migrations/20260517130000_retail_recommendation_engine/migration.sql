-- Retail recommendation engine with explainable rule outputs and decision logs

CREATE TYPE "RecommendationType" AS ENUM ('TRANSFER', 'RESTOCK', 'DEADSTOCK_ALERT', 'HIGH_DEMAND_ALERT');
CREATE TYPE "RecommendationStatus" AS ENUM ('OPEN', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'EXPIRED');
CREATE TYPE "RecommendationDecisionAction" AS ENUM ('ACCEPT', 'REJECT', 'COMPLETE', 'EXPIRE', 'NOTE');

CREATE TABLE "retail_recommendations" (
  "id" TEXT NOT NULL,
  "type" "RecommendationType" NOT NULL,
  "status" "RecommendationStatus" NOT NULL DEFAULT 'OPEN',
  "productId" TEXT NOT NULL,
  "sourceStoreId" TEXT,
  "destinationStoreId" TEXT,
  "quantity" INTEGER,
  "confidenceScore" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "reason" TEXT NOT NULL,
  "signals" JSONB,
  "expectedImpact" JSONB,
  "outcome" JSONB,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "retail_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "retail_recommendation_decision_logs" (
  "id" TEXT NOT NULL,
  "recommendationId" TEXT NOT NULL,
  "action" "RecommendationDecisionAction" NOT NULL,
  "note" TEXT,
  "metadata" JSONB,
  "decidedByUserId" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "retail_recommendation_decision_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "retail_recommendations_organizationId_status_generatedAt_idx" ON "retail_recommendations"("organizationId", "status", "generatedAt");
CREATE INDEX "retail_recommendations_organizationId_type_status_idx" ON "retail_recommendations"("organizationId", "type", "status");
CREATE INDEX "retail_recommendations_organizationId_productId_status_idx" ON "retail_recommendations"("organizationId", "productId", "status");
CREATE INDEX "retail_recommendations_organizationId_sourceStoreId_status_idx" ON "retail_recommendations"("organizationId", "sourceStoreId", "status");
CREATE INDEX "retail_recommendations_organizationId_destinationStoreId_status_idx" ON "retail_recommendations"("organizationId", "destinationStoreId", "status");
CREATE INDEX "retail_recommendation_decision_logs_organizationId_recommend_idx" ON "retail_recommendation_decision_logs"("organizationId", "recommendationId", "createdAt");
CREATE INDEX "retail_recommendation_decision_logs_organizationId_action_cre_idx" ON "retail_recommendation_decision_logs"("organizationId", "action", "createdAt");

ALTER TABLE "retail_recommendations" ADD CONSTRAINT "retail_recommendations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "retail_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "retail_recommendations" ADD CONSTRAINT "retail_recommendations_sourceStoreId_fkey" FOREIGN KEY ("sourceStoreId") REFERENCES "retail_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "retail_recommendations" ADD CONSTRAINT "retail_recommendations_destinationStoreId_fkey" FOREIGN KEY ("destinationStoreId") REFERENCES "retail_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "retail_recommendations" ADD CONSTRAINT "retail_recommendations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "retail_recommendation_decision_logs" ADD CONSTRAINT "retail_recommendation_decision_logs_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "retail_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "retail_recommendation_decision_logs" ADD CONSTRAINT "retail_recommendation_decision_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
