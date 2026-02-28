"use client";

import { DeadstockItem } from "@/types/deadstock.types";
import CountUp from "react-countup";

interface Props {
  data: DeadstockItem[];
}

export default function DeadstockRiskBreakdown({ data }: Props) {
  const storeMap: Record<string, number> = {};

  data.forEach((item) => {
    if (!storeMap[item.store]) storeMap[item.store] = 0;
    storeMap[item.store] += item.deadStockValue;
  });

  const stores = Object.entries(storeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxValue = Math.max(...stores.map(([, value]) => value));

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">

      {/* Header */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-900">
          Store Exposure
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Capital blocked per store
        </p>
      </div>

      {/* Chart Area */}
      <div className="flex items-end justify-between h-72 gap-8">

        {stores.map(([store, value]) => {
          const heightPercent = (value / maxValue) * 100;

          return (
            <div
              key={store}
              className="flex flex-col items-center justify-end flex-1"
            >
              {/* Value */}
              <div className="text-xs text-gray-600 mb-3">
                ₹
                <CountUp
                  end={value}
                  duration={1.3}
                  separator=","
                />
              </div>

              {/* Bar Wrapper (fixed height reference) */}
              <div className="relative w-14 h-52 bg-orange-50 rounded-2xl overflow-hidden">

                {/* Actual Bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500 to-orange-400 rounded-2xl transition-all duration-700 ease-out"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Store Label */}
              <p className="text-xs text-gray-500 mt-4 text-center leading-tight">
                {store}
              </p>
            </div>
          );
        })}

      </div>
    </div>
  );
}