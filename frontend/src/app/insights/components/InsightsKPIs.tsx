"use client";

import { useInsights } from "@/hooks/useInsightsOverview";
import { formatCurrency } from "@/lib/format";

export default function InsightsKPIs() {
  const { data, isLoading, error } = useInsights();

  if (isLoading) return null;

  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-red-600">
        Failed to load insights
      </div>
    );
  }

  const riskColor =
    data.deadstockRisk === "High"
      ? "bg-red-100 text-red-600"
      : data.deadstockRisk === "Medium"
      ? "bg-orange-100 text-orange-600"
      : "bg-green-100 text-green-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Total Revenue</p>
        <h2 className="text-2xl font-semibold mt-2">
          {formatCurrency(data.totalRevenue)}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Gross Margin</p>
        <h2 className="text-2xl font-semibold mt-2">
          {data.grossMargin}%
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Top Performer</p>
        <h2 className="text-lg font-semibold mt-2">
          {data.topPerformer}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Worst Performer</p>
        <h2 className="text-lg font-semibold mt-2">
          {data.worstPerformer}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Highest Margin Category</p>
        <h2 className="text-lg font-semibold mt-2">
          {data.highestMarginCategory}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Deadstock Value</p>
        <h2 className="text-xl font-semibold mt-2">
          {formatCurrency(data.deadStockValue)}
        </h2>

        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${riskColor}`}
        >
          Risk: {data.deadstockRisk}
        </span>
      </div>
    </div>
  );
}