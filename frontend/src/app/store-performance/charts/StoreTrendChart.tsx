"use client";

import { useStorePerformance } from "@/hooks/useStorePerformance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StoreTrendChart() {
  const { data } = useStorePerformance();
  if (!data) return null;

  const trendData = data.map((store, index) => ({
    index,
    profit: store.totalGrossProfit,
  }));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
      <h2 className="text-lg font-semibold mb-4">
        Profit Distribution Trend
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trendData}>
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#f97316"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}