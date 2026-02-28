"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/services/recommendation.service";
import { RecommendationItem } from "@/types/recommendation.types";

export const useRecommendations = () => {
  return useQuery<RecommendationItem[]>({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
    staleTime: 1000 * 60 * 5,
  });
};