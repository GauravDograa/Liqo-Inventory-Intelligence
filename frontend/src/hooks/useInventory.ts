"use client";

import { useQuery } from "@tanstack/react-query";
import { getInsightsOverview } from "@/services/inventory.service";
import { InventoryItem } from "@/types/inventory.types";

export const useInventory = () => {
  return useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: getInsightsOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};