"use client";

import { useStorePerformance } from "@/hooks/useStorePerformance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StorePerformanceBarChart() {
  const { data } = useStorePerformance();
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
      <h2 className="text-lg font-semibold mb-4">
        Revenue by Store
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <XAxis dataKey="storeName" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="totalRevenue"
            fill="#f97316"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}