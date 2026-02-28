"use client";

import InventoryHeader from "./components/InventoryHeader";
import InventoryKPIs from "./kpi/InventoryKPIs";
import StockByCategoryChart from "./charts/StockByCategoryChart";
import InventoryAgingChart from "./charts/InventoryAgingChart";
import InventoryTable from "./tables/InventoryTable";

export default function InventoryPage() {
  return (
    <div className="space-y-10">
      <InventoryHeader />
      <InventoryKPIs />

      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <StockByCategoryChart />
        <InventoryAgingChart />
      </section>

      <InventoryTable />
    </div>
  );
}