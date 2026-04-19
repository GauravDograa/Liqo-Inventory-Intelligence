"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { formatCurrency } from "@/lib/format";
import { useStorePerformance } from "@/hooks/useStorePerformance";

export default function StoreRankingTable() {
  const { data, isLoading } = useStorePerformance();

  if (isLoading || !data) return null;

  const sorted = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <SurfaceCard
      title="Store Ranking"
      subtitle="A cleaner leaderboard ordered by revenue with profit, margin, and transaction context at a glance."
      action={
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          Ranked by Revenue
        </div>
      }
    >
      <div className="overflow-hidden rounded-[1.6rem] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffedd5_100%)] text-sm text-slate-500">
                <th className="px-6 py-4">Store</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Margin</th>
                <th className="px-6 py-4">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((store) => (
                <tr
                  key={store.storeId}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-950">{store.storeName}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {store.storeId}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatCurrency(store.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {formatCurrency(store.totalGrossProfit)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {store.grossMargin.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {store.transactionCount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SurfaceCard>
  );
}
