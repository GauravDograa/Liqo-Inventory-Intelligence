"use client";

import { useQuery } from "@tanstack/react-query";
import { getInsights } from "@/services/insights.service";
import { InsightsOverview } from "@/types/insights.types";

export const useInsights = () => {
  return useQuery<InsightsOverview>({
    queryKey: ["insights-overview"],
    queryFn: getInsights,
  });
};