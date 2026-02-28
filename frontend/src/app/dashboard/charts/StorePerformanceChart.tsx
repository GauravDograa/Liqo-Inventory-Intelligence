"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import Card from "@/app/dashboard/components/ui/Card";
import { useStorePerformance } from "@/hooks/useStorePerformance";
import { formatCurrency } from "@/lib/format";

export default function PremiumStoreBarChart() {
  const { data = [], isLoading, isError } =
    useStorePerformance();

  const chartData = data.map((store) => ({
    name: store.storeName?.replace("Liqo ", ""),
    revenue: store.totalRevenue,
  }));

  if (isLoading) {
    return (
    <Card className="h-[380px] animate-pulse">
    <div />
  </Card>
  )
  }

  if (isError || chartData.length === 0) {
    return (
      <Card className="h-[380px] flex items-center justify-center text-sm text-slate-500">
        No data available
      </Card>
    );
  }

  return (
    <Card className="h-[420px] p-6 border border-orange-200 rounded-2xl shadow-2xl">

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Store Revenue Overview
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Performance comparison across locations
        </p>
      </div>

      <ResponsiveContainer width="100%" height="75%">
        <BarChart
          data={chartData}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#fde68a"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#9a3412"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) =>
              `₹${(value / 1000000).toFixed(1)}M`
            }
            tick={{ fontSize: 12 }}
            stroke="#9a3412"
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{ fill: "#fff7ed" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #fed7aa",
              fontSize: "13px",
            }}
            formatter={(value: number | string | undefined) =>
            formatCurrency(Number(value ?? 0))
            }
          />

          <Bar
            dataKey="revenue"
            radius={[12, 12, 0, 0]}
            fill="#f97316"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}