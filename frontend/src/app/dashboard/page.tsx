"use client";

import KPISection from "@/app/dashboard/kpi/KPISection";
import RevenueLineChart from "@/app/dashboard/charts/RevenueLineChart";
import CategoryPieChart from "@/app/dashboard/charts/CategoryPieChart";
import StorePerformanceChart from "@/app/dashboard/charts/StorePerformanceChart";
import StoreMovementCard from "@/app/dashboard/cards/StoreMovementCard";
import DeadstockTable from "@/app/dashboard/tables/DeadstockTable";
import RecommendationsTable from "@/app/dashboard/tables/RecommendationsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
              Real-time performance insights across revenue, profitability,
              and inventory risk exposure.
            </p>
          </div>
        </div>
      </div>

      <KPISection />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="space-y-4 lg:col-span-3 lg:space-y-6">
          <RevenueLineChart />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <CategoryPieChart />
            <StorePerformanceChart />
          </div>
        </div>

        <div className="lg:col-span-1">
          <StoreMovementCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <DeadstockTable />
        <RecommendationsTable />
      </div>
    </div>
  );
}
