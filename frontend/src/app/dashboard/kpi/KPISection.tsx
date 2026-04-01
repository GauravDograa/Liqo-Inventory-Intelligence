"use client";

import Link from "next/link";
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
    <div className="space-y-6">
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
          value={(data.transactions ?? 0).toString()}
          subtitle="Higher store activity"
        />
      </div>

      <Link
        href="/decision-lab"
        className="block rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-sm transition hover:shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
          Decision Lab
        </p>
        <h3 className="mt-3 text-2xl font-semibold">
          Open simulation and ML forecast workspace
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">
          Review transfer impact, compare forecast model performance, and
          understand which model is driving planning decisions in one guided
          page.
        </p>
      </Link>
    </div>
  );
}
