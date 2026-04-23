"use client";

import type { ReactNode } from "react";
import { Activity, AlertTriangle, CircleDollarSign, ShieldAlert, Store, Tags } from "lucide-react";
import { useInsights } from "@/hooks/useInsightsOverview";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      <KpiTile
        className="xl:col-span-3"
        icon={<CircleDollarSign size={18} />}
        label="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        context={`Run-rate signal: ${formatCompactNumber(data.totalRevenue)}`}
      />
      <KpiTile
        className="xl:col-span-2"
        icon={<Activity size={18} />}
        label="Gross Margin"
        value={`${data.grossMargin}%`}
        context="Current blended margin performance"
      />
      <KpiTile
        className="xl:col-span-3"
        icon={<Store size={18} />}
        label="Top Performer"
        value={data.topPerformer}
        context="Strongest revenue contribution"
      />
      <KpiTile
        className="xl:col-span-2"
        icon={<Tags size={18} />}
        label="Best Category"
        value={data.highestMarginCategory}
        context="Highest margin category"
      />
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.75)] xl:col-span-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
            <ShieldAlert size={18} />
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskColor}`}>
            {data.deadstockRisk}
          </span>
        </div>
        <p className="mt-5 text-sm text-white/70">Deadstock Value</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {formatCurrency(data.deadStockValue)}
        </h2>
        <p className="mt-3 text-xs leading-6 text-white/60">
          Current inventory exposure that may need liquidation, transfers, or tighter replenishment control.
        </p>
      </div>
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)] xl:col-span-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Performance Watchlist</p>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">
              Weakest store right now: {data.worstPerformer}
            </h3>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Combine the weakest store, category margin mix, and deadstock risk to decide whether the next move should be markdown, transfer, or local demand activation.
        </p>
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  context,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  context: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)] ${className}`}
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </h2>
      <p className="mt-3 text-xs leading-6 text-slate-500">{context}</p>
    </div>
  );
}
