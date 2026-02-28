import { api } from "@/lib/axios";
import {
  AggregatedDashboardResponse,
} from "@/types/dashboard.types";

export const getAggregatedDashboard = async () => {
  const { data } =
    await api.get<AggregatedDashboardResponse>(
      "dashboard/overview"
    );

  if (!data.success) {
    throw new Error("Failed to fetch dashboard");
  }

  return data.data;
};