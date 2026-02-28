import { api } from "@/lib/axios";
import {
  CategoryPerformanceItem,
  CategoryPerformanceResponse,
} from "@/types/category.types";

export const getCategoryPerformance =
  async (): Promise<CategoryPerformanceItem[]> => {
    const { data } =
      await api.get<CategoryPerformanceResponse>(
        "categories/performance"
      );

    if (!data.success) {
      throw new Error("Failed to fetch category performance");
    }

    return data.data ?? [];
  };