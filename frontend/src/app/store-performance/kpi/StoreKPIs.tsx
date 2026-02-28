"use client";

import { useStorePerformance } from "@/hooks/useStorePerformance";
import StoreKPICard from "../cards/StoreKPICard";
import { formatCurrency } from "@/lib/format";

export default function StoreKPIs() {
  const { data, isLoading } = useStorePerformance();

  if (isLoading || !data) return null;

  const totalRevenue = data.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalProfit = data.reduce((acc, s) => acc + s.totalGrossProfit, 0);
  const totalTransactions = data.reduce(
    (acc, s) => acc + s.transactionCount,
    0
  );

  const avgMargin =
    totalRevenue === 0 ? 0 : (totalProfit / totalRevenue) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <StoreKPICard
    label="Total Revenue"
    value={formatCurrency(totalRevenue)}
    />

    <StoreKPICard
    label="Total Profit"
    value={formatCurrency(totalProfit)}
    />
      <StoreKPICard
        label="Avg Margin"
        value={`${avgMargin.toFixed(2)}%`}
      />
      <StoreKPICard
        label="Transactions"
        value={totalTransactions.toLocaleString()}
      />
    </div>
  );
}