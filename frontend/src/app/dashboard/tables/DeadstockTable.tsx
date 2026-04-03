"use client";

import { useDeadstock } from "@/hooks/useDeadstock";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DeadstockTable() {
  const { data, isLoading, error } = useDeadstock();

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-xl lg:h-[500px]">
        <span className="text-slate-500 font-medium">
          Loading deadstock data...
        </span>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-xl lg:h-[500px]">
        <span className="text-red-600 font-medium">
          Failed to load deadstock data
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[500px]">
      
      {/* 🔥 Premium Gradient Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px] bg-gradient-to-r from-orange-400 via-orange-300 to-orange-300 px-5 py-4 sm:px-8 sm:py-5">
          <div className="grid grid-cols-4 text-xs font-semibold uppercase tracking-widest text-white">
          <span>Store</span>
          <span>Category</span>
          <span>Stock Age</span>
          <span className="text-right">Deadstock Value</span>
          </div>
        </div>
      </div>

      {/* 💎 Scrollable Body */}
      <div className="flex-1 overflow-auto divide-y divide-slate-100">
        <div className="min-w-[540px]">
        {data.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-4 items-center px-5 py-4 transition duration-200 hover:bg-orange-50 sm:px-8 sm:py-5"
          >
            {/* Store */}
            <div className="font-semibold text-slate-600">
              {item.store?.replace("Liqo ", "")}
            </div>

            {/* Category */}
            <div className="text-slate-600 font-medium">
              {item.category}
            </div>

            {/* Age with risk logic */}
            <div>
              <span
                className={`text-sm font-semibold ${
                  item.stockAgeDays > 150
                    ? "text-red-600"
                    : item.stockAgeDays > 120
                    ? "text-orange-600"
                    : item.stockAgeDays > 90
                    ? "text-amber-500"
                    : "text-slate-600"
                }`}
              >
                {item.stockAgeDays} days
              </span>
            </div>

            {/* Value */}
            <div className="text-right text-sm font-bold text-slate-600">
              {formatCurrency(item.deadStockValue)}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
