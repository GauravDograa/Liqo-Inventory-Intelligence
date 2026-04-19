"use client";

import { useState } from "react";
import { DeadstockItem } from "@/types/deadstock.types";

import { useDeadstock } from "@/hooks/useDeadstock";
import DeadstockFilters from "./components/DeadstockFilters";
import DeadstockRiskBar from "./components/DeadstockRiskBar";
import DeadstockAgingChart from "./components/DeadstockAgingChart";
import DeadstockRiskBreakdown from "./components/DeadstockRiskBreakdown";
import DeadstockTable from "./components/DeadstockTable/DeadstockTable";
import DeadstockDrawer from "./components/DeadstockDrawer/DeadstockDrawer";

export default function DeadstockPage() {
  const { data, isLoading, isError } = useDeadstock();
  const [selected, setSelected] = useState<DeadstockItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-[2rem] bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[2rem] bg-slate-200/70" />
          <div className="h-80 animate-pulse rounded-[2rem] bg-slate-200/70" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[2rem] border border-rose-100 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-600">
        Error loading deadstock insights.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DeadstockFilters />
      <DeadstockRiskBar data={data} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DeadstockAgingChart data={data} />
        <DeadstockRiskBreakdown data={data} />
      </div>

      <DeadstockTable data={data} onRowClick={setSelected} />
      <DeadstockDrawer item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
