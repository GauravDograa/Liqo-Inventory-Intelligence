import { Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import { getDashboardOverview } from "./dashboard.service";
import { getCategoryPerformance } from "../category/category.service";
import { getPerformance } from "../storePerformance/storePerformance.service";
import { getDeadStockSummary } from "../deadstock/deadstock.service";

const DASHBOARD_CACHE_TTL_MS = 1000 * 60 * 2;

type AggregatedDashboardPayload = {
  overview: Awaited<ReturnType<typeof getDashboardOverview>>;
  categories: Awaited<ReturnType<typeof getCategoryPerformance>>;
  stores: Awaited<ReturnType<typeof getPerformance>>;
  deadstock: Awaited<ReturnType<typeof getDeadStockSummary>>;
};

type DashboardCacheEntry = {
  expiresAt: number;
  data?: AggregatedDashboardPayload;
  promise?: Promise<AggregatedDashboardPayload>;
};

const dashboardCache = new Map<string, DashboardCacheEntry>();

const buildAggregatedDashboard = async (
  orgId: string
): Promise<AggregatedDashboardPayload> => {
  const [overview, categories, stores, deadstock] =
    await Promise.all([
      getDashboardOverview(orgId, undefined, undefined, undefined, "30d", true),
      getCategoryPerformance(orgId),
      getPerformance(orgId),
      getDeadStockSummary(orgId),
    ]);

  return {
    overview,
    categories,
    stores,
    deadstock,
  };
};

const refreshAggregatedDashboard = async (
  orgId: string
): Promise<AggregatedDashboardPayload> => {
  const existingEntry = dashboardCache.get(orgId);

  if (existingEntry?.promise) {
    return existingEntry.promise;
  }

  const promise = buildAggregatedDashboard(orgId);
  dashboardCache.set(orgId, {
    ...existingEntry,
    promise,
  });

  try {
    const data = await promise;
    dashboardCache.set(orgId, {
      data,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    });
    return data;
  } catch (error) {
    if (existingEntry?.data) {
      dashboardCache.set(orgId, existingEntry);
    } else {
      dashboardCache.delete(orgId);
    }
    throw error;
  }
};

export const getAggregatedDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  const orgId = req.user!.organizationId;
  const cachedEntry = dashboardCache.get(orgId);
  const isFresh =
    cachedEntry?.data && cachedEntry.expiresAt > Date.now();

  if (isFresh) {
    return res.json({
      success: true,
      data: cachedEntry.data,
      meta: {
        cache: "hit",
      },
    });
  }

  if (cachedEntry?.data) {
    void refreshAggregatedDashboard(orgId);

    return res.json({
      success: true,
      data: cachedEntry.data,
      meta: {
        cache: "stale",
      },
    });
  }

  const data = await refreshAggregatedDashboard(orgId);

  res.json({
    success: true,
    data,
    meta: {
      cache: "miss",
    },
  });
};

export const warmAggregatedDashboardCache = async (orgId: string) => {
  try {
    await refreshAggregatedDashboard(orgId);
  } catch (error) {
    console.error("Failed to warm dashboard cache:", error);
  }
};
