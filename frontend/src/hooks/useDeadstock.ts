"use client";

import { useQuery } from "@tanstack/react-query";
import { getDeadstock } from "@/services/deadstock.service";
import { DeadstockItem } from "@/types/deadstock.types";

export const useDeadstock = () => {
  return useQuery<DeadstockItem[]>({
    queryKey: ["deadstock"],
    queryFn: getDeadstock,
    staleTime: 1000 * 60 * 5,
  });
};