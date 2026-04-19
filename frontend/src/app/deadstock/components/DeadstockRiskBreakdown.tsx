"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { formatCurrency } from "@/lib/format";
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

  const maxValue = Math.max(...stores.map(([, value]) => value), 1);

  return (
    <SurfaceCard
      title="Store Exposure"
      subtitle="Compare which locations are carrying the heaviest concentration of deadstock value so intervention can start where it matters most."
    >
      <div className="grid grid-cols-2 gap-4 pb-3 md:grid-cols-3 xl:grid-cols-6">
        {stores.map(([store, value]) => {
          const heightPercent = (value / maxValue) * 100;

          return (
            <div
              key={store}
              className="rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)] p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {store}
              </div>
              <div className="mt-4 flex h-44 items-end">
                <div className="relative h-full w-full overflow-hidden rounded-[1.4rem] bg-orange-100/70">
                  <div className="absolute inset-x-3 top-3 h-px bg-white/70" />
                  <div
                    className="absolute inset-x-2 bottom-2 rounded-[1rem] bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 transition-all duration-700 ease-out"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold tracking-tight text-slate-950">
                  ₹
                  <CountUp end={value} duration={1.3} separator="," />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(value)} locked capital
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
