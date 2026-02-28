import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import { getDashboardOverview } from "./dashboard.service";
import { getCategoryPerformance } from "../category/category.service";
import { getPerformance } from "../storePerformance/storePerformance.service";
import { getDeadStockSummary } from "../deadstock/deadstock.service";

export const getAggregatedDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  const orgId = req.user!.organizationId;

  const [overview, categories, stores, deadstock] =
    await Promise.all([
      getDashboardOverview(),
      getCategoryPerformance(),
      getPerformance(orgId),
      getDeadStockSummary(orgId)
    ]);

  res.json({
    success: true,
    data: {
      overview,
      categories,
      stores,
      deadstock
    }
  });
};