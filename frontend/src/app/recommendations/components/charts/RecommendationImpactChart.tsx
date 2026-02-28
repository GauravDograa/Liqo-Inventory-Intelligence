"use client";

import { useRecommendations } from "@/hooks/useRecommendations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RecommendationImpactChart() {
  const { data } = useRecommendations();
  if (!data) return null;

  const map: Record<string, number> = {};

  data.forEach((item) => {
    map[item.skuCategory] =
      (map[item.skuCategory] || 0) +
      item.impact.demandCoverageDays;
  });

  const chartData = Object.entries(map).map(
    ([category, impact]) => ({
      category,
      impact,
    })
  );

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">
        Demand Coverage Impact by Category
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="impact" fill="#f97316" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}