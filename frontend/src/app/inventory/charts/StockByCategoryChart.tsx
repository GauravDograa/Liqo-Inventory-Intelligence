"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/format";
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

export default function StockByCategoryChart() {
  const { data } = useInventory();
  if (!data) return null;

  const categoryMap: Record<string, number> = {};

  data.forEach((item) => {
    const category = item.sku.category;
    const value = item.unitsSaleable * item.sku.acquisitionCost;
    categoryMap[category] = (categoryMap[category] || 0) + value;
  });

  const chartData = Object.entries(categoryMap)
    .map(([category, value]) => ({
      category,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const fills = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fb923c"];

  return (
    <SurfaceCard
      title="Stock Value by Category"
      subtitle="Compare which categories hold the most capital so inventory concentration is easier to spot."
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
            tickFormatter={(value) => formatCurrency(value).replace(".00", "")}
            width={84}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Stock Value"]}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #fed7aa",
              boxShadow: "0 18px 45px -24px rgba(15,23,42,0.35)",
            }}
            cursor={{ fill: "rgba(251, 146, 60, 0.10)" }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((item, index) => (
              <Cell key={item.category} fill={fills[index % fills.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SurfaceCard>
  );
}
