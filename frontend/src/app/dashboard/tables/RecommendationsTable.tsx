"use client";

import { useMemo } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { formatCoverageDays } from "@/lib/format";

export default function RecommendationsTable() {
  const { data = [], isLoading, error } = useRecommendations();
  const sortedData = useMemo(
    () =>
      [...data].sort((a, b) => {
        const fromCompare = a.moveFrom.localeCompare(b.moveFrom);
        if (fromCompare !== 0) return fromCompare;

        const categoryCompare =
          a.skuCategory.localeCompare(b.skuCategory);
        if (categoryCompare !== 0) return categoryCompare;

        const toCompare = a.moveTo.localeCompare(b.moveTo);
        if (toCompare !== 0) return toCompare;

        return b.quantity - a.quantity;
      }),
    [data]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-xl lg:h-[500px]">
        <span className="text-slate-500 font-medium">
          Loading recommendations...
        </span>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-xl lg:h-[500px]">
        <span className="text-red-600 font-medium">
          Failed to load recommendations
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[500px]">
      
      {/* Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px] bg-gradient-to-r from-orange-400 via-orange-300 to-orange-300 px-5 py-4 sm:px-8 sm:py-5">
          <div className="grid grid-cols-5 text-xs font-semibold uppercase tracking-widest text-white">
          <span>Category</span>
          <span>From</span>
          <span>To</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Coverage</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto divide-y divide-slate-100">
        <div className="min-w-[640px]">
        {sortedData.map((item, index) => {
          const previousItem = sortedData[index - 1];
          const isNewSource =
            !previousItem || previousItem.moveFrom !== item.moveFrom;

          return (
          <div
            key={index}
            className={`grid grid-cols-5 items-center px-5 py-4 transition duration-200 hover:bg-orange-50 sm:px-8 sm:py-5 ${
              isNewSource ? "border-t border-orange-100" : ""
            }`}
          >
            <div className="font-semibold text-slate-900">
              {item.skuCategory}
            </div>

            <div className="text-slate-600 font-medium">
              {isNewSource ? item.moveFrom?.replace("Liqo ", "") : ""}
            </div>

            <div className="text-slate-600 font-medium">
              {item.moveTo?.replace("Liqo ", "")}
            </div>

            <div className="text-right font-semibold text-slate-800">
              {item.quantity}
            </div>

            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  (item.mlSignals?.confidence ?? 0) >= 0.7
                    ? "bg-green-100 text-green-600"
                    : (item.mlSignals?.confidence ?? 0) >= 0.6
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {formatCoverageDays(item.impact?.afterCoverageDays)} target
              </span>
            </div>
          </div>
        );
        })}
        </div>
      </div>
    </div>
  );
}
