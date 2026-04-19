"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { formatCurrency } from "@/lib/format";
import { useStorePerformance } from "@/hooks/useStorePerformance";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  Line,
  ComposedChart,
} from "recharts";

export default function StoreTrendChart() {
  const { data } = useStorePerformance();
  if (!data) return null;

  const trendData = [...data]
    .sort((a, b) => b.totalGrossProfit - a.totalGrossProfit)
    .map((store) => ({
      store: store.storeName,
      profit: store.totalGrossProfit,
    }));

  return (
    <SurfaceCard
      title="Profit Distribution Trend"
      subtitle="A smoother read on profit concentration across stores so sharp drop-offs stand out immediately."
    >
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={trendData}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis
            dataKey="store"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value).replace(".00", "")}
            width={84}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), "Profit"]}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #fed7aa",
              boxShadow: "0 18px 45px -24px rgba(15,23,42,0.35)",
            }}
          />
          <Area
            type="monotone"
            dataKey="profit"
            fill="rgba(249, 115, 22, 0.16)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#fff7ed" }}
            activeDot={{ r: 6, fill: "#f97316" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </SurfaceCard>
  );
}
