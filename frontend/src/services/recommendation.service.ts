import { api } from "@/lib/axios";
import {
  RecommendationItem,
  RecommendationResponse,
} from "@/types/recommendation.types";

export const getRecommendations = async (): Promise<RecommendationItem[]> => {
  const { data } =
    await api.get<RecommendationResponse>("recommendations");

  if (!data.success) {
    throw new Error("Failed to fetch recommendations");
  }

  return data.data ?? [];
};