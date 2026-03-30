"use client";

import { useMutation } from "@tanstack/react-query";
import { askAiInsightsQuestion } from "@/services/insights.service";

export const useAskAiInsights = () => {
  return useMutation({
    mutationFn: askAiInsightsQuestion,
  });
};
