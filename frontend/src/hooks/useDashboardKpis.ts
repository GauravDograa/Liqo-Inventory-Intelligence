"use client";

import { useDashboardOverview  } from "./useDashboardOverview";
import { useDeadstock } from "./useDeadstock";

export const useDashboardKpis = () => {
  const overviewQuery = useDashboardOverview();
  const deadstockQuery = useDeadstock();

  const isLoading =
    overviewQuery.isLoading || deadstockQuery.isLoading;

  const isError =
    overviewQuery.isError || deadstockQuery.isError;

  const totalDeadstock =
    deadstockQuery.data?.reduce(
      (sum, item) => sum + item.deadStockValue,
      0
    ) ?? 0;

  const overview = overviewQuery.data;

  return {
    isLoading,
    isError,
    data: overview
      ? {
          totalRevenue: overview.totalRevenue,
          grossProfit: overview.grossProfit,
          transactions: overview.totalTransactions,
          deadstockValue: totalDeadstock,
        }
      : null,
  };
};