"use client";

import { useAggregatedDashboard } from "./useAggregatedDashboard";

export const useDeadstock = () => {
  return useAggregatedDashboard((data) => data.deadstock);
};
