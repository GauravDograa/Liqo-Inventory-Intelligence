"use client";

import { useInventory } from "@/hooks/useInventory";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export default function StockByCategoryChart() {
  const { data } = useInventory();
  if (!data) return null;

  const categoryMap: Record<string, number> = {};

  data.forEach((item) => {
    const category = item.sku.category;

    const value =
      item.unitsSaleable *
      item.sku.acquisitionCost;

    categoryMap[category] =
      (categoryMap[category] || 0) + value;
  });

  const chartData = Object.entries(categoryMap).map(
    ([category, value]) => ({
      category,
      value,
    })
  );

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">
        Stock Value by Category
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip
            formatter={(value: number) =>
              formatCurrency(value)
            }
          />
          <Bar
            dataKey="value"
            fill="#f97316"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}