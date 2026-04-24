"use client";

import Card from "@/app/dashboard/components/ui/Card";
import { useDashboardRecommendations } from "@/hooks/useDashboardRecommendations";
import { ArrowRight } from "lucide-react";
import { formatCoverageChange, formatCoverageDays } from "@/lib/format";

export default function StoreMovementCard() {
  const { data = [], isLoading, error } = useDashboardRecommendations();

  if (isLoading) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center lg:h-[650px]">
        Loading...
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center lg:h-[650px]">
        Failed to load
      </Card>
    );
  }

  const movements = data.slice(0, 8);

  return (
    <Card className="flex min-h-[420px] flex-col p-4 shadow-2xl sm:p-6 lg:h-[842px]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
          Store Movements
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Recommended inter-store inventory transfers
        </p>
      </div>

      {/* Movements List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {movements.map((item, index) => (
          <div
            key={index}
            className="relative bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
          >
            {/* Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-2xl" />

            <div className="pl-3">
              {/* Category */}
              <div className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">
                {item.skuCategory}
              </div>

              {/* Movement */}
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">
                <span>{item.moveFrom}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span>{item.moveTo}</span>
              </div>

              {/* Details */}
              <div className="mt-2 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Qty:{" "}
                  <span className="font-medium text-slate-700">
                    {item.quantity}
                  </span>
                </span>

                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  {formatCoverageChange(item.impact.demandCoverageDays)} to{" "}
                  {formatCoverageDays(item.impact.afterCoverageDays)}
                </span>
              </div>

              {/* Reason */}
              <div className="mt-2 text-xs text-slate-500">
                {item.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
