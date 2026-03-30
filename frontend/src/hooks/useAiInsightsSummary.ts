"use client";

import { useQuery } from "@tanstack/react-query";
import { getAiInsightsSummary } from "@/services/insights.service";
import { AiInsightsSummary } from "@/types/insights.types";

export const useAiInsightsSummary = () => {
  return useQuery<AiInsightsSummary>({
    queryKey: ["insights-ai-summary"],
    queryFn: getAiInsightsSummary,
    staleTime: 1000 * 60 * 5,
  });
};
