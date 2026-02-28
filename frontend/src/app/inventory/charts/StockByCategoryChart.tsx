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
  const { data } = useInventory<InventoryItem[]>();
  if (!data) return null;

  const items = data as InventoryItem[]; // ensure we have an array

  const categoryMap: Record<string, number> = {};

  items.forEach((item) => {
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