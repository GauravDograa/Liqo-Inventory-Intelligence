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

export interface AiInsightsSummary {
  summary: string;
  risks: string[];
  actions: string[];
  followUpQuestions: string[];
  source: "openai" | "fallback";
}

export interface AiInsightsResponse {
  success: boolean;
  data: AiInsightsSummary;
}

export interface AiInsightsAnswer {
  answer: string;
  source: "openai" | "fallback";
}

export interface AiInsightsAnswerResponse {
  success: boolean;
  data: AiInsightsAnswer;
}
