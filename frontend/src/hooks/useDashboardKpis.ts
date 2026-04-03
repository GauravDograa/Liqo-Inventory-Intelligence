"use client";

import { useDashboardOverview } from "./useDashboardOverview";

export const useDashboardKpis = () => {
  const overviewQuery = useDashboardOverview();
  const isLoading = overviewQuery.isLoading;
  const isError = overviewQuery.isError;

  const overview = overviewQuery.data;

  return {
    isLoading,
    isError,
    data: overview
      ? {
          totalRevenue: overview.totalRevenue,
          grossProfit: overview.grossProfit,
          transactions: overview.totalTransactions,
          deadstockValue: overview.deadstockValue ?? 0,
        }
      : null,
  };
};
