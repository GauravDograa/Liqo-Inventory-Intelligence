"use client";

import StorePerformanceHeader from "./components/StorePerformanceHeader";
import StoreKPIs from "./kpi/StoreKPIs";
import StorePerformanceBarChart from "./charts/StorePerformanceBarChart";
import StoreTrendChart from "./charts/StoreTrendChart";
import StoreRankingTable from "./tables/StoreRankingTable";

export default function StorePerformancePage() {
  return (
    <div className="space-y-10">
      <StorePerformanceHeader />

      <section className="space-y-6">
        <StoreKPIs />
      </section>

      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <StorePerformanceBarChart />
        <StoreTrendChart />
      </section>

      <section>
        <StoreRankingTable />
      </section>
    </div>
  );
}