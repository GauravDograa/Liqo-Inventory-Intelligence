"use client";

import { DeadstockItem } from "@/types/deadstock.types";
import { calculateRiskScore } from "@/lib/utils";
import CountUp from "react-countup";

interface Props {
  data: DeadstockItem[];
}

export default function DeadstockRiskBar({ data }: Props) {
  const totalValue = data.reduce(
    (sum, item) => sum + item.deadStockValue,
    0
  );

  const highRiskCount = data.filter(
    (item) => calculateRiskScore(item) >= 70
  ).length;

  const avgAging =
    data.reduce((sum, item) => sum + item.stockAgeDays, 0) /
    (data.length || 1);

  return (
    <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-10">
      
      {/* Title Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Deadstock Performance Overview
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Capital exposure and aging risk snapshot
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        
        <Metric
          label="Total Deadstock Value"
          value={totalValue}
          isCurrency
          highlight
        />

        <Metric
          label="High Risk SKUs"
          value={highRiskCount}
        />

        <Metric
          label="Average Aging"
          value={Math.round(avgAging)}
          suffix=" days"
        />

        <Metric
          label="Total SKUs"
          value={data.length}
        />
      </div>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  suffix?: string;
  highlight?: boolean;
}

function Metric({
  label,
  value,
  isCurrency = false,
  suffix = "",
  highlight = false,
}: MetricProps) {
  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300
      ${
        highlight
          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"
          : "bg-orange-50"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-wider ${
          highlight ? "text-orange-100" : "text-gray-500"
        }`}
      >
        {label}
      </p>

      <div className="mt-4 text-3xl font-bold">
        {isCurrency && "₹"}
        <CountUp end={value} duration={1.4} separator="," />
        {suffix}
      </div>

      {/* Subtle decorative accent */}
      {highlight && (
        <div className="mt-4 h-1 w-12 bg-white/40 rounded-full" />
      )}
    </div>
  );
}