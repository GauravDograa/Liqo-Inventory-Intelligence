"use client";

import { useQuery } from "@tanstack/react-query";
import { getSimulationComparison } from "@/services/simulation.service";
import { SimulationComparisonResult } from "@/types/simulation.types";

export const useSimulationComparison = () => {
  return useQuery<SimulationComparisonResult>({
    queryKey: ["simulation-comparison"],
    queryFn: getSimulationComparison,
    staleTime: 1000 * 60 * 5,
  });
};
