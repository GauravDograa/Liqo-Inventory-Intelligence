"use client";

import { useMemo, useState } from "react";
import SurfaceCard from "@/components/analytics/SurfaceCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import { formatCoverageChange, formatCoverageDays } from "@/lib/format";

export default function RecommendationTable() {
  const { data } = useRecommendations();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const rows = useMemo(() => data ?? [], [data]);

  const totalPages = Math.ceil(rows.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  if (!data) return null;

  const showingFrom = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, rows.length);

  return (
    <SurfaceCard
      title="Store-to-Store Recommendations"
      subtitle="Compact transfer queue."
      action={
        <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
          {rows.length} moves
        </div>
      }
      className="p-4 sm:p-5"
    >
      <div className="overflow-hidden rounded-[1.15rem] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffedd5_100%)] text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Move From</th>
                <th className="px-4 py-2.5">Move To</th>
                <th className="px-4 py-2.5">Qty</th>
                <th className="px-4 py-2.5">Coverage Impact</th>
                <th className="px-4 py-2.5">Reason</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={`${item.moveFrom}-${item.moveTo}-${item.skuCategory}-${index}`}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-950">{item.skuCategory}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      Reallocation candidate
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{item.moveFrom}</td>
                  <td className="px-4 py-2.5 text-slate-700">{item.moveTo}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                      {item.quantity} units
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div>
                      <div className="font-medium text-slate-800">
                        {formatCoverageDays(item.impact.beforeCoverageDays)} to{" "}
                        {formatCoverageDays(item.impact.afterCoverageDays)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        Change {formatCoverageChange(item.impact.demandCoverageDays)},
                        {" "}target {formatCoverageDays(item.impact.targetCoverageDays)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] leading-5 text-slate-600">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">
          Showing {showingFrom}-{showingTo} of {rows.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Prev 10
          </button>

          <div className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white">
            {page} / {Math.max(totalPages, 1)}
          </div>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next 10
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}
