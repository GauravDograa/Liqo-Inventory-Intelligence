"use client";

import { useQuery } from "@tanstack/react-query";
import { getStorePerformance } from "@/services/store.service";
import { StorePerformanceItem } from "@/types/store.types";

export const useStorePerformance = () => {
  return useQuery<StorePerformanceItem[]>({
    queryKey: ["store-performance"],
    queryFn: getStorePerformance,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};