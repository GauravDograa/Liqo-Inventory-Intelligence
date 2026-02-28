"use client";

import KPICard from "./KPICard";
import { useDashboardKpis } from "@/hooks/useDashboardKpis";
import { formatCurrency } from "@/lib/format";

export default function KPISection() {
  const { data, isLoading, isError } =
    useDashboardKpis();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[140px] rounded-2xl bg-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-500">
        Failed to load KPIs
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
      <KPICard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        subtitle="Strong revenue growth"
        highlight
      />

      <KPICard
        title="Gross Profit"
        value={formatCurrency(data.grossProfit)}
        subtitle="Improved margin performance"
      />

      <KPICard
        title="Deadstock Value"
        value={formatCurrency(data.deadstockValue)}
        subtitle="Reduced inventory aging"
      />

      <KPICard
        title="Transactions"
        value={(data.transactions??0).toString()}
        subtitle="Higher store activity"
      />
    </div>
  );
}