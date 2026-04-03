"use client";

import { useAggregatedDashboard } from "./useAggregatedDashboard";

export const useDashboardOverview = () => {
  return useAggregatedDashboard((data) => data.overview);
};
