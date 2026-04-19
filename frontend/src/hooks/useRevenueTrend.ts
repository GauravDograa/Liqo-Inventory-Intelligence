"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type RevenueRange = "30d" | "3m" | "6m";

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export const useRevenueTrend = (range: RevenueRange) => {
  return useQuery<RevenueTrendPoint[]>({
    queryKey: ["revenue-trend", range],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/overview?range=${range}`);

      if (!data.success) {
        throw new Error("Failed to fetch revenue trend");
      }

      return data.data.revenueTrend ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
};
