export interface InsightsOverview {
  totalRevenue: number;
  grossMargin: number;
  topPerformer: string;
  worstPerformer: string;
  highestMarginCategory: string;
  deadStockValue: number;
  deadstockRisk: "Low" | "Medium" | "High";
}

export interface InsightsResponse {
  success: boolean;
  data: InsightsOverview;
}