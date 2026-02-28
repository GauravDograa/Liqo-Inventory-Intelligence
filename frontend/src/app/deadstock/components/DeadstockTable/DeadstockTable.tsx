"use client";

import { useMemo, useState } from "react";
import { DeadstockItem } from "@/types/deadstock.types";
import RiskScoreCell from "./RiskScoreCell";
import { calculateRiskScore, getRiskLevel } from "@/lib/utils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Props {
  data: DeadstockItem[];
  onRowClick: (item: DeadstockItem) => void;
}

export default function DeadstockTable({ data, onRowClick }: Props) {
  const pageSize = 10;

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  /* ===============================
     Helper: Unique Row ID
  =============================== */
  const getRowId = (item: DeadstockItem): string =>
    `${item.store}-${item.sku}`;

  /* ===============================
     Search Filter
  =============================== */
  const filteredData = useMemo<DeadstockItem[]>(() => {
    return data.filter((item) =>
      `${item.sku} ${item.store} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  /* ===============================
     Sort by Highest Risk
  =============================== */
  const sortedData = useMemo<DeadstockItem[]>(() => {
    return [...filteredData].sort(
      (a, b) => calculateRiskScore(b) - calculateRiskScore(a)
    );
  }, [filteredData]);

  /* ===============================
     Pagination
  =============================== */
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo<DeadstockItem[]>(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  /* ===============================
     Selection Logic
  =============================== */
  const toggleRow = (id: string): void => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = (): void => {
    const pageIds = paginatedData.map((item) => getRowId(item));

    const allSelected =
      pageIds.length > 0 &&
      pageIds.every((id) => selectedRows.has(id));

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

  /* ===============================
     Export Selected
  =============================== */
  const exportSelected = (): void => {
    const selectedData = data.filter((item) =>
      selectedRows.has(getRowId(item))
    );

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

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">

      {/* ===============================
         Toolbar
      =============================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by SKU, Store, Category..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-orange-400
                     focus:border-orange-400 text-sm transition"
        />

        {/* Selection + Export */}
        <div className="flex items-center gap-4">
          {selectedRows.size > 0 && (
            <span className="text-sm text-orange-600 font-medium">
              {selectedRows.size} selected
            </span>
          )}

          <button
            onClick={exportSelected}
            disabled={selectedRows.size === 0}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${
                selectedRows.size === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
              }
            `}
          >
            Export Selected
          </button>
        </div>
      </div>

      {/* ===============================
         Table
      =============================== */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-orange-50 text-gray-700 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((item) =>
                      selectedRows.has(getRowId(item))
                    )
                  }
                  onChange={toggleAll}
                  className="w-4 h-4 accent-orange-500 cursor-pointer"
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
                  className={`border-b border-gray-100 cursor-pointer transition-all duration-200
                    ${isSelected ? "bg-orange-50" : "hover:bg-orange-50"}
                    ${borderColor}
                  `}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      className="w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.sku}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.store}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.unitsSaleable}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.stockAgeDays} days
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ₹{item.deadStockValue.toLocaleString()}
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

      {/* ===============================
         Pagination
      =============================== */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-500">
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, sortedData.length)} of{" "}
          {sortedData.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>

          <div className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm">
            {page}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}