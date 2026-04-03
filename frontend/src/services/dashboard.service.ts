import { api } from "@/lib/axios";
import {
  AggregatedDashboardResponse,
  DashboardOverview,
} from "@/types/dashboard.types";

interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverview;
}

export const getDashboardOverview = async (
  months?: number
): Promise<DashboardOverview> => {
  const { data } =
    await api.get<DashboardOverviewResponse>(
      months
        ? `/dashboard/overview?months=${months}`
        : "/dashboard/overview"
    );

  if (!data.success) {
    throw new Error("Failed to fetch dashboard overview");
  }

  return data.data;
};

export const getAggregatedDashboard = async () => {
  const { data } = await api.get<AggregatedDashboardResponse>(
    "/dashboard"
  );

  if (!data.success) {
    throw new Error("Failed to fetch dashboard");
  }

  return data.data;
};
