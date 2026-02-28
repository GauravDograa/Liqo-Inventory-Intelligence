import { api } from "@/lib/axios";
import { InsightsOverview, InsightsResponse } from "@/types/insights.types";

export const getInsights = async (): Promise<InsightsOverview> => {
  const { data } = await api.get<InsightsResponse>(
    "insights/overview"
  );

  if (!data.success) {
    throw new Error("Failed to fetch insights");
  }

  return data.data;
};