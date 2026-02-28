import { api } from "@/lib/axios";
import { InsightsOverview, InsightsResponse } from "@/types/insights.types";

export const getInsightsOverview = async (): Promise<InsightsOverview> => {
  const { data } = await api.get<InsightsResponse>("insights/overview");

  if (!data.success) {
    throw new Error("Failed to fetch insights overview");
  }

  return data.data;
};