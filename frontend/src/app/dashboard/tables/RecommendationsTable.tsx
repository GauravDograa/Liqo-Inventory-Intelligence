"use client";

import { useRecommendations } from "@/hooks/useRecommendations";

export default function RecommendationsTable() {
  const { data = [], isLoading, error } = useRecommendations();

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white rounded-3xl shadow-xl">
        <span className="text-slate-500 font-medium">
          Loading recommendations...
        </span>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white rounded-3xl shadow-xl">
        <span className="text-red-600 font-medium">
          Failed to load recommendations
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl shadow-2xl bg-white overflow-hidden h-[500px] flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-300 px-8 py-5">
        <div className="grid grid-cols-5 text-white text-xs tracking-widest uppercase font-semibold">
          <span>Category</span>
          <span>From</span>
          <span>To</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Coverage</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {data.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-5 px-8 py-5 items-center hover:bg-orange-50 transition duration-200"
          >
            <div className="font-semibold text-slate-900">
              {item.skuCategory}
            </div>

            <div className="text-slate-600 font-medium">
              {item.moveFrom?.replace("Liqo ", "")}
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
                  item.impact?.demandCoverageDays < 30
                    ? "bg-red-100 text-red-600"
                    : item.impact?.demandCoverageDays < 60
                    ? "bg-orange-100 text-orange-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {item.impact?.demandCoverageDays}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}