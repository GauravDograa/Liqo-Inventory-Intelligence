"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryPerformance } from "@/services/category.service";

export const useCategoryPerformance = () => {
  return useQuery({
    queryKey: ["dashboard", "category-performance"],
    queryFn: getCategoryPerformance,
  });
};