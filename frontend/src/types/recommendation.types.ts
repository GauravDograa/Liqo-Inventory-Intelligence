export interface RecommendationImpact {
  demandCoverageDays: number;
}

export interface RecommendationItem {
  skuCategory: string;
  skuId: string;
  moveFrom: string;
  moveTo: string;
  quantity: number;
  reason: string;
  impact: RecommendationImpact;
}

export interface RecommendationResponse {
  success: boolean;
  data: RecommendationItem[];
}