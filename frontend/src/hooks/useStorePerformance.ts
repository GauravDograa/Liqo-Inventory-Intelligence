"use client";

import { useAggregatedDashboard } from "./useAggregatedDashboard";

export const useStorePerformance = () => {
  return useAggregatedDashboard((data) => data.stores);
};
