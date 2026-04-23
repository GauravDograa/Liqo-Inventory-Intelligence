import { api } from "@/lib/axios";
import {
  AiInsightsAnswer,
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
  const response = await fetch("/api/ai-insights/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to get AI answer");
  }

  return data.data;
};
