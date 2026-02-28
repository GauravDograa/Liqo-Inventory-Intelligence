"use client";

import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/services/inventory.service";
import { InventoryItem } from "@/types/inventory.types";

export const useInventory = () => {
  return useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: getInventory,
    staleTime: 1000 * 60 * 5,
  });
};