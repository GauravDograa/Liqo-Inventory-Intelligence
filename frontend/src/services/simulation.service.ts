import { api } from "@/lib/axios";
import {
  SimulationComparisonResponse,
  SimulationResponse,
} from "@/types/simulation.types";

export const getSimulation = async () => {
  const { data } = await api.get<SimulationResponse>(
    "/simulation/run"
  );

  if (!data.success) {
    throw new Error("Failed to fetch simulation");
  }

  return data.data;
};

export const getSimulationComparison = async () => {
  const { data } = await api.get<SimulationComparisonResponse>(
    "/simulation/compare-models"
  );

  if (!data.success) {
    throw new Error("Failed to fetch simulation comparison");
  }

  return data.data;
};
