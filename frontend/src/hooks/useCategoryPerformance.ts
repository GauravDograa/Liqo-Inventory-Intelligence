"use client";

import { useAggregatedDashboard } from "./useAggregatedDashboard";

export const useCategoryPerformance = () => {
  return useAggregatedDashboard((data) => data.categories);
};
