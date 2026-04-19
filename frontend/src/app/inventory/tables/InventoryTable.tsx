"use client";

import { useMemo, useState } from "react";
import SurfaceCard from "@/components/analytics/SurfaceCard";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/format";

export default function InventoryTable() {
  const { data, isLoading } = useInventory();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const rows = useMemo(() => data ?? [], [data]);

  const totalPages = Math.ceil(rows.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  if (isLoading || !data) return null;

  const showingFrom = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, rows.length);

  return (
    <SurfaceCard
      title="Inventory Details"
      action={
        <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
          {rows.length} inventory rows
        </div>
      }
      className="p-4 sm:p-5"
    >
      <div className="overflow-hidden rounded-[1.15rem] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffedd5_100%)] text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-2.5">Store</th>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Stock</th>
                <th className="px-4 py-2.5">Stock Value</th>
                <th className="px-4 py-2.5">Aging</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item) => {
                const stock = item.unitsSaleable;
                const value = item.unitsSaleable * item.sku.acquisitionCost;
                const lowStock = stock < 10;
                const agingRisk = item.stockAgeDays > 90;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-950">{item.store.name}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        {item.store.region ?? "Region not set"}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-slate-700">
                      {item.skuId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{item.sku.category}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {stock.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-950">
                      {formatCurrency(value)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {item.stockAgeDays} days
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          lowStock
                            ? "bg-red-100 text-red-600"
                            : agingRisk
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {lowStock ? "Low Stock" : agingRisk ? "Aging Risk" : "Healthy"}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
