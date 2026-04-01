"use client";

import { useRecommendations } from "@/hooks/useRecommendations";
import { formatCoverageChange, formatCoverageDays } from "@/lib/format";

export default function RecommendationTable() {
  const { data } = useRecommendations();
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-6">
        Store-to-Store Recommendations
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-sm border-b">
            <th className="pb-3">Category</th>
            <th>Move From</th>
            <th>Move To</th>
            <th>Qty</th>
            <th>Coverage Impact</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="py-4 font-medium">
                {item.skuCategory}
              </td>
              <td>{item.moveFrom}</td>
              <td>{item.moveTo}</td>
              <td>{item.quantity}</td>
              <td>
                <div className="py-4">
                  <div className="font-medium text-slate-800">
                    {formatCoverageDays(item.impact.beforeCoverageDays)} to{" "}
                    {formatCoverageDays(item.impact.afterCoverageDays)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Change {formatCoverageChange(item.impact.demandCoverageDays)},
                    target {formatCoverageDays(item.impact.targetCoverageDays)}
                  </div>
                </div>
              </td>
              <td>{item.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
