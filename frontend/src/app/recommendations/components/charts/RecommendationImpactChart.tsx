"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { useRecommendations } from "@/hooks/useRecommendations";
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

export default function RecommendationImpactChart() {
  const { data } = useRecommendations();
  if (!data) return null;

  const map: Record<string, number> = {};

  data.forEach((item) => {
    map[item.skuCategory] = (map[item.skuCategory] || 0) + item.quantity;
  });

  const chartData = Object.entries(map)
    .map(([category, units]) => ({
      category,
      units,
    }))
    .sort((a, b) => b.units - a.units);

  const fills = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fb923c"];

  return (
    <SurfaceCard
      title="Units Reallocated by Category"
      subtitle="See which merchandise categories carry the biggest transfer volume and where recommendation pressure is concentrated."
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barCategoryGap={18}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} units`, "Units"]}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #fed7aa",
              boxShadow: "0 18px 45px -24px rgba(15,23,42,0.35)",
            }}
            cursor={{ fill: "rgba(251, 146, 60, 0.10)" }}
          />
          <Bar dataKey="units" radius={[8, 8, 0, 0]}>
            {chartData.map((item, index) => (
              <Cell key={item.category} fill={fills[index % fills.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SurfaceCard>
  );
}
