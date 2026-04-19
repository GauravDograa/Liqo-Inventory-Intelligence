"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { DeadstockItem } from "@/types/deadstock.types";
import { calculateRiskScore } from "@/lib/utils";
import CountUp from "react-countup";

interface Props {
  data: DeadstockItem[];
}

export default function DeadstockRiskBar({ data }: Props) {
  const totalValue = data.reduce((sum, item) => sum + item.deadStockValue, 0);
  const highRiskCount = data.filter((item) => calculateRiskScore(item) >= 70).length;
  const avgAging =
    data.reduce((sum, item) => sum + item.stockAgeDays, 0) / (data.length || 1);

  return (
    <SurfaceCard
      title="Deadstock Performance Overview"
      subtitle="A single snapshot of capital blocked, high-risk inventory, aging intensity, and the scale of the active SKU pool."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total Deadstock Value"
          value={totalValue}
          isCurrency
          highlight
          helper={formatCompactNumber(totalValue)}
        />
        <Metric
          label="High Risk SKUs"
          value={highRiskCount}
          helper={`${Math.round((highRiskCount / (data.length || 1)) * 100)}% of portfolio`}
        />
        <Metric
          label="Average Aging"
          value={Math.round(avgAging)}
          suffix=" days"
          helper="Older stock needs faster intervention"
        />
        <Metric
          label="Total SKUs"
          value={data.length}
          helper="Tracked in this deadstock view"
        />
      </div>
    </SurfaceCard>
  );
}

interface MetricProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  suffix?: string;
  highlight?: boolean;
  helper?: string;
}

function Metric({
  label,
  value,
  isCurrency = false,
  suffix = "",
  highlight = false,
  helper,
}: MetricProps) {
  return (
    <div
      className={`rounded-[1.6rem] p-6 transition-all duration-300 ${
        highlight
          ? "bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 text-white shadow-[0_18px_45px_-24px_rgba(249,115,22,0.75)]"
          : "border border-orange-100 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)]"
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.22em] ${
          highlight ? "text-orange-100" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <div
        className={`mt-4 font-bold tracking-tight ${
          highlight ? "text-3xl" : "text-[2rem] text-slate-950"
        }`}
      >
        {isCurrency && "₹"}
        <CountUp end={value} duration={1.4} separator="," />
        {suffix}
      </div>

      {helper ? (
        <p className={`mt-3 text-sm ${highlight ? "text-white/80" : "text-slate-500"}`}>
          {isCurrency ? `${formatCurrency(value)} total exposure` : helper}
        </p>
      ) : null}

      {highlight && helper ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-white/80">
          <span className="h-2 w-2 rounded-full bg-white/80" />
          {helper}
        </div>
      ) : null}
    </div>
  );
}
