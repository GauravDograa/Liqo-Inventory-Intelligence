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
      <div className="h-[500px] flex items-center justify-center bg-white rounded-3xl shadow-xl">
        <span className="text-slate-500 font-medium">
          Loading deadstock data...
        </span>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-white rounded-3xl shadow-xl">
        <span className="text-red-600 font-medium">
          Failed to load deadstock data
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl shadow-2xl bg-white overflow-hidden h-[500px] flex flex-col">
      
      {/* 🔥 Premium Gradient Header */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-300 px-8 py-5">
        <div className="grid grid-cols-4 text-white text-xs tracking-widest uppercase font-semibold">
          <span>Store</span>
          <span>Category</span>
          <span>Stock Age</span>
          <span className="text-right">Deadstock Value</span>
        </div>
      </div>

      {/* 💎 Scrollable Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {data.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-4 px-8 py-5 items-center hover:bg-orange-50 transition duration-200"
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
            <div className="text-right font-bold text-slate-600 text-sm">
              {formatCurrency(item.deadStockValue)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}