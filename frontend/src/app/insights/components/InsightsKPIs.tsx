"use client";

import { useInsights } from "@/hooks/useInsightsOverview";
import { formatCurrency } from "@/lib/format";

export default function InsightsKPIs() {
  const { data, isLoading, error } = useInsights();

  if (isLoading) return null;

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-red-600 shadow-sm">
        Failed to load insights
      </div>
    );
  }

  const riskColor =
    data.deadstockRisk === "High"
      ? "bg-red-100 text-red-600"
      : data.deadstockRisk === "Medium"
      ? "bg-orange-100 text-orange-600"
      : "bg-green-100 text-green-600";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-gray-500">Total Revenue</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {formatCurrency(data.totalRevenue)}
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-gray-500">Gross Margin</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {data.grossMargin}%
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-gray-500">Top Performer</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          {data.topPerformer}
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-gray-500">Worst Performer</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          {data.worstPerformer}
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-gray-500">Highest Margin Category</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          {data.highestMarginCategory}
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-gray-500">Deadstock Value</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {formatCurrency(data.deadStockValue)}
        </h2>

        <span
          className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${riskColor}`}
        >
          Risk: {data.deadstockRisk}
        </span>
      </div>
    </div>
  );
}
