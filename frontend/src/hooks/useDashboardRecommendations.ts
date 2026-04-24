"use client";

import { useAggregatedDashboard } from "./useAggregatedDashboard";

export const useDashboardRecommendations = () => {
  return useAggregatedDashboard((data) => data.recommendations);
};
