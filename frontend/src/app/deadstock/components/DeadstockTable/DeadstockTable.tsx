"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SurfaceCard from "@/components/analytics/SurfaceCard";
import { formatCurrency } from "@/lib/format";
import { DeadstockItem } from "@/types/deadstock.types";
import { calculateRiskScore, getRiskLevel } from "@/lib/utils";
import RiskScoreCell from "./RiskScoreCell";

interface Props {
  data: DeadstockItem[];
  onRowClick: (item: DeadstockItem) => void;
}

export default function DeadstockTable({ data, onRowClick }: Props) {
  const pageSize = 10;
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const getRowId = (item: DeadstockItem): string => `${item.store}-${item.sku}`;

  const filteredData = useMemo<DeadstockItem[]>(() => {
    return data.filter((item) =>
      `${item.sku} ${item.store} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const sortedData = useMemo<DeadstockItem[]>(() => {
    return [...filteredData].sort(
      (a, b) => calculateRiskScore(b) - calculateRiskScore(a)
    );
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo<DeadstockItem[]>(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  const toggleRow = (id: string): void => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleAll = (): void => {
    const pageIds = paginatedData.map((item) => getRowId(item));
    const allSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedRows.has(id));

    if (allSelected) {
      const updated = new Set(selectedRows);
      pageIds.forEach((id) => updated.delete(id));
      setSelectedRows(updated);
    } else {
      const updated = new Set(selectedRows);
      pageIds.forEach((id) => updated.add(id));
      setSelectedRows(updated);
    }
  };

  const exportSelected = (): void => {
    const selectedData = data.filter((item) => selectedRows.has(getRowId(item)));
    if (selectedData.length === 0) return;

    const formatted = selectedData.map((item) => ({
      SKU: item.sku,
      Store: item.store,
      Category: item.category,
      Units: item.unitsSaleable,
      Aging: `${item.stockAgeDays} days`,
      Value: item.deadStockValue,
      RiskScore: calculateRiskScore(item),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deadstock");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, "deadstock_selected.xlsx");
  };

  const showingFrom = sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, sortedData.length);

  return (
    <SurfaceCard
      title="SKU-Level Risk Queue"
      subtitle="Review the most exposed store and SKU combinations, filter quickly, and export the rows that need follow-up."
      action={
        <div className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          {sortedData.length} total rows
        </div>
      }
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="text"
          placeholder="Search by SKU, Store, Category..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100 lg:max-w-md"
        />

        <div className="flex items-center gap-4">
          {selectedRows.size > 0 ? (
            <span className="rounded-full bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600">
              {selectedRows.size} selected
            </span>
          ) : null}

          <button
            onClick={exportSelected}
            disabled={selectedRows.size === 0}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              selectedRows.size === 0
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
            }`}
          >
            Export Selected
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.7rem] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffedd5_100%)] text-xs uppercase tracking-[0.18em] text-slate-600">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((item) => selectedRows.has(getRowId(item)))
                    }
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer accent-orange-500"
                  />
                </th>
                <th className="px-6 py-4 text-left">SKU</th>
                <th className="px-6 py-4 text-left">Store</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Units</th>
                <th className="px-6 py-4 text-left">Aging</th>
                <th className="px-6 py-4 text-left">Value</th>
                <th className="px-6 py-4 text-left">Risk Score</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item) => {
                const id = getRowId(item);
                const isSelected = selectedRows.has(id);
                const riskScore = calculateRiskScore(item);
                const riskLevel = getRiskLevel(riskScore);

                const borderColor =
                  riskLevel === "HIGH"
                    ? "border-l-4 border-red-500"
                    : riskLevel === "MEDIUM"
                    ? "border-l-4 border-orange-500"
                    : "border-l-4 border-green-500";

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick(item)}
                    className={`cursor-pointer border-b border-slate-100 transition-all duration-200 ${
                      isSelected ? "bg-orange-50/80" : "bg-white hover:bg-slate-50"
                    } ${borderColor}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        className="h-4 w-4 cursor-pointer accent-orange-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{item.sku}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {riskLevel} priority
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.store}</td>
                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {item.unitsSaleable.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {item.stockAgeDays} days
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      {formatCurrency(item.deadStockValue)}
                    </td>
                    <td className="px-6 py-4">
                      <RiskScoreCell score={riskScore} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-500">
          Showing {showingFrom}-{showingTo} of {sortedData.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>

          <div className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white">
            {page} / {Math.max(totalPages, 1)}
          </div>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}
