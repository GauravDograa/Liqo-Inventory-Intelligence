export interface RecommendationImpact {
  demandCoverageDays: number;
  imbalanceBefore?: number;
  beforeCoverageDays?: number;
  afterCoverageDays?: number;
  targetCoverageDays?: number;
  stockAgeDays?: number;
}

export interface RecommendationFeatureSnapshot {
  currentUnits: number;
  sourceCoverageDays: number;
  destinationCoverageDays: number;
  sourceVelocityPerDay: number;
  destinationVelocityPerDay: number;
  stockAgeDays: number;
  grossMarginPct?: number | null;
  demandSource?: string;
  sourceDemandConfidence?: number;
  destinationDemandConfidence?: number;
}

export interface RecommendationMlSignals {
  confidence: number;
  rankingScore: number;
  readyForModel: boolean;
}

export interface RecommendationItem {
  skuCategory: string;
  skuId: string;
  moveFrom: string;
  moveTo: string;
  quantity: number;
  reason: string;
  impact: RecommendationImpact;
  featureSnapshot?: RecommendationFeatureSnapshot;
  mlSignals?: RecommendationMlSignals;
}

export interface RecommendationResponse {
  success: boolean;
  data: RecommendationItem[];
}
