"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { formatCurrency } from "@/lib/format";
import { useStorePerformance } from "@/hooks/useStorePerformance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function StorePerformanceBarChart() {
  const { data } = useStorePerformance();
  if (!data) return null;

  const chartData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const fills = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fdba74", "#fb923c"];

  return (
    <SurfaceCard
      title="Revenue by Store"
      subtitle="Ranked location performance with a cleaner axis system and fast-read tooltip for revenue contribution."
    >
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} barCategoryGap={18}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis
            dataKey="storeName"
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
            formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #fed7aa",
              boxShadow: "0 18px 45px -24px rgba(15,23,42,0.35)",
            }}
            cursor={{ fill: "rgba(251, 146, 60, 0.10)" }}
          />
          <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={entry.storeId} fill={fills[index % fills.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SurfaceCard>
  );
}
