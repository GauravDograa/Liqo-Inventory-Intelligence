"use client";

import { useQuery } from "@tanstack/react-query";
import { getSimulation } from "@/services/simulation.service";
import { SimulationResult } from "@/types/simulation.types";

export const useSimulation = () => {
  return useQuery<SimulationResult>({
    queryKey: ["simulation"],
    queryFn: getSimulation,
    staleTime: 1000 * 60 * 5,
  });
};
