"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useRevenueTrend = (months: number) => {
  return useQuery({
    queryKey: ["revenue-trend", months],
    queryFn: async () => {
      const { data } = await api.get(
        `/dashboard/overview?months=${months}`
      );

      if (!data.success) {
        throw new Error("Failed to fetch revenue trend");
      }

      return data.data.revenueTrend;
    },
    staleTime: 1000 * 60 * 2,
  });
};