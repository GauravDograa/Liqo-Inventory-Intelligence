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

type InventoryItem = {
  unitsSaleable: number;
  sku: {
    category: string;
    acquisitionCost: number;
  };
};

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
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip
          formatter={(value) =>
            formatCurrency(Number(value ?? 0))
          }
        />
        <Bar
          dataKey="value"
          fill="#f97316"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}