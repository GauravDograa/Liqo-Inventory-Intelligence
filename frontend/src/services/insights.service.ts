import { api } from "@/lib/axios";
import {
  AiInsightsAnswer,
  AiInsightsAnswerResponse,
  AiInsightsResponse,
  AiInsightsSummary,
  InsightsOverview,
  InsightsResponse,
} from "@/types/insights.types";

export const getInsights = async (): Promise<InsightsOverview> => {
  const { data } = await api.get<InsightsResponse>(
    "/insights/overview"
  );

  if (!data.success) {
    throw new Error("Failed to fetch insights");
  }

  return data.data;
};

export const getAiInsightsSummary = async (): Promise<AiInsightsSummary> => {
  const { data } = await api.get<AiInsightsResponse>(
    "/insights/ai-summary"
  );

  if (!data.success) {
    throw new Error("Failed to fetch AI insights");
  }

  return data.data;
};

export const askAiInsightsQuestion = async (
  question: string
): Promise<AiInsightsAnswer> => {
  const { data } = await api.post<AiInsightsAnswerResponse>(
    "/insights/ask",
    { question }
  );

  if (!data.success) {
    throw new Error("Failed to get AI answer");
  }

  return data.data;
};
