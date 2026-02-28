"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Card from "@/app/dashboard/components/ui/Card";
import { useRevenueTrend } from "@/hooks/useRevenueTrend";

const ranges = [
  { label: "30D", value: 1 },
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export default function RevenueLineChart() {
  const [months, setMonths] = useState(1);
  const { data, isLoading, error } = useRevenueTrend(months);

  if (isLoading)
    return <Card className="h-[400px] p-8">Loading...</Card>;

  if (error || !data)
    return <Card className="h-[400px] p-8">Failed to load</Card>;

  return (
    <Card className="h-[400px] p-8 flex flex-col shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        {/* Bigger Premium Title */}
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
          Revenue Trend
        </h3>

        {/* Toggle Bar */}
        <div className="relative bg-slate-100 rounded-full p-1 flex">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => setMonths(range.value)}
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                months === range.value
                  ? "text-white"
                  : "text-slate-600"
              }`}
            >
              {range.label}
            </button>
          ))}

          {/* Sliding Active Background */}
          <div
            className={`absolute top-1 bottom-1 w-1/3 rounded-full bg-orange-500 transition-all duration-300 ${
              months === 1
                ? "left-1"
                : months === 3
                ? "left-1/3"
                : "left-2/3"
            }`}
          />
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          
          <defs>
            <linearGradient
              id="colorRevenue"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#e2e8f0"
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{
              fontSize: 13,
              fontWeight: 500,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) =>
              `₹${(value / 1000000).toFixed(1)}M`
            }
            tick={{
              fontSize: 13,
              fontWeight: 500,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 500,
            }}
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => formatDate(label)}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#f97316"
            strokeWidth={3}
            fill="url(#colorRevenue)"
            dot={false}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}