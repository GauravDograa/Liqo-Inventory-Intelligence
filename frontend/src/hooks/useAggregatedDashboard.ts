"use client";

import { useQuery } from "@tanstack/react-query";
import { getAggregatedDashboard } from "@/services/dashboard.service";
import { AggregatedDashboardApi } from "@/types/dashboard.types";

export const useAggregatedDashboard = <TData = AggregatedDashboardApi>(
  select?: (data: AggregatedDashboardApi) => TData
) => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getAggregatedDashboard,
    staleTime: 1000 * 60 * 5,
    select,
  });
};
