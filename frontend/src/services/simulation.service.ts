import { api } from "@/lib/axios";
import { SimulationResponse } from "@/types/simulation.types";

export const getSimulation = async () => {
  const { data } = await api.get<SimulationResponse>(
    "/simulation"
  );
  return data;
};