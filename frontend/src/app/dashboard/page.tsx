"use client";

import dynamic from "next/dynamic";
import KPISection from "@/app/dashboard/kpi/KPISection";

const RevenueLineChart = dynamic(
  () => import("@/app/dashboard/charts/RevenueLineChart"),
  {
    loading: () => <ChartSkeleton className="h-[320px] sm:h-[400px]" />,
  }
);

const CategoryPieChart = dynamic(
  () => import("@/app/dashboard/charts/CategoryPieChart"),
  {
    loading: () => <ChartSkeleton className="h-[360px] sm:h-[420px]" />,
  }
);

const StorePerformanceChart = dynamic(
  () => import("@/app/dashboard/charts/StorePerformanceChart"),
  {
    loading: () => <ChartSkeleton className="h-[360px] sm:h-[420px]" />,
  }
);

const StoreMovementCard = dynamic(
  () => import("@/app/dashboard/cards/StoreMovementCard"),
  {
    loading: () => <PanelSkeleton className="min-h-[420px] lg:h-[842px]" />,
  }
);

const DeadstockTable = dynamic(
  () => import("@/app/dashboard/tables/DeadstockTable"),
  {
    loading: () => <PanelSkeleton className="min-h-[360px] lg:h-[500px]" />,
  }
);

const RecommendationsTable = dynamic(
  () => import("@/app/dashboard/tables/RecommendationsTable"),
  {
    loading: () => <PanelSkeleton className="min-h-[360px] lg:h-[500px]" />,
  }
);

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

function ChartSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <div className="h-full animate-pulse">
        <div className="h-5 w-40 rounded-full bg-slate-200" />
        <div className="mt-6 h-[calc(100%-3rem)] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function PanelSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="h-full animate-pulse">
        <div className="h-5 w-44 rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-56 rounded-full bg-slate-100" />
        <div className="mt-6 h-[calc(100%-4rem)] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
