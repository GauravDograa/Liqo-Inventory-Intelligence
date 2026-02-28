"use client";

import { useState } from "react";
import { DeadstockItem } from "@/types/deadstock.types";

import { useDeadstock } from "@/hooks/useDeadstock";
import DeadstockHeader from "./components/DeadstockHeader";
import DeadstockFilters from "./components/DeadstockFilters";
import DeadstockRiskBar from "./components/DeadstockRiskBar";
import DeadstockAgingChart from "./components/DeadstockAgingChart";
import DeadstockRiskBreakdown from "./components/DeadstockRiskBreakdown";
import DeadstockTable from "./components/DeadstockTable/DeadstockTable";
import DeadstockDrawer from "./components/DeadstockDrawer/DeadstockDrawer";

export default function DeadstockPage() {
  const { data, isLoading, isError } = useDeadstock();
  const [selected, setSelected] = useState<DeadstockItem | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error loading data</div>;

  return (
    <div className="space-y-8">
      <DeadstockFilters />
      <DeadstockRiskBar data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DeadstockAgingChart data={data} />
        <DeadstockRiskBreakdown data={data} />
      </div>

      <DeadstockTable data={data} onRowClick={setSelected} />
      <DeadstockDrawer item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}