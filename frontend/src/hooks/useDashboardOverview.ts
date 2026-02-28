"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/overview");

      if (!data.success) {
        throw new Error("Failed to fetch dashboard overview");
      }

      return data.data; // full overview
    },
    staleTime: 1000 * 60 * 5,
  });
};