"use client";

import { useInventory } from "@/hooks/useInventory";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function InventoryAgingChart() {
  const { data } = useInventory();
  // ensure `data` is defined and is an array before iterating
  if (!data || !Array.isArray(data)) return null;

  // cast to a known shape so TypeScript understands the collection
  const inventoryItems = data as { agingDays: number }[];

  const buckets = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  };

  inventoryItems.forEach((item) => {
    if (item.agingDays <= 30) buckets["0-30"]++;
    else if (item.agingDays <= 60) buckets["31-60"]++;
    else if (item.agingDays <= 90) buckets["61-90"]++;
    else buckets["90+"]++;
  });

  const chartData = Object.entries(buckets).map(
    ([name, value]) => ({ name, value })
  );

  const COLORS = ["#22c55e", "#facc15", "#f97316", "#ef4444"];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">
        Inventory Aging Distribution
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            outerRadius={100}
            label
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}