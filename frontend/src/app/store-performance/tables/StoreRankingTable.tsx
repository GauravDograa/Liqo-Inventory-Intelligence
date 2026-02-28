"use client";

import { useStorePerformance } from "@/hooks/useStorePerformance";

export default function StoreRankingTable() {
  const { data, isLoading } = useStorePerformance();

  if (isLoading || !data) return null;

  const sorted = [...data].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
      <h2 className="text-lg font-semibold mb-6">
        Store Ranking (By Revenue)
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-sm border-b">
            <th className="pb-3">Store</th>
            <th>Revenue</th>
            <th>Profit</th>
            <th>Margin</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((store) => (
            <tr
              key={store.storeId}
              className="border-b hover:bg-orange-50 transition"
            >
              <td className="py-4 font-medium">
                {store.storeName}
              </td>
              <td>${store.totalRevenue.toLocaleString()}</td>
              <td>${store.totalGrossProfit.toLocaleString()}</td>
              <td>{store.grossMargin.toFixed(2)}%</td>
              <td>{store.transactionCount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}