"use client";

import dynamic from "next/dynamic";
import {
  HeroSkeleton,
  CardGridSkeleton,
  PanelSkeleton,
  TableSkeleton,
} from "@/components/ui/RouteSkeletons";

const StorePerformanceHeader = dynamic(
  () => import("./components/StorePerformanceHeader"),
  {
    loading: () => <HeroSkeleton />,
  }
);

const StoreKPIs = dynamic(() => import("./kpi/StoreKPIs"), {
  loading: () => <CardGridSkeleton />,
});

const StorePerformanceBarChart = dynamic(
  () => import("./charts/StorePerformanceBarChart"),
  {
    loading: () => <PanelSkeleton className="h-80" />,
  }
);

const StoreTrendChart = dynamic(() => import("./charts/StoreTrendChart"), {
  loading: () => <PanelSkeleton className="h-80" />,
});

const StoreRankingTable = dynamic(() => import("./tables/StoreRankingTable"), {
  loading: () => <TableSkeleton className="h-96" />,
});

export default function StorePerformancePage() {
  return (
    <div className="space-y-8">
      <StorePerformanceHeader />

      <section className="space-y-6">
        <StoreKPIs />
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <StorePerformanceBarChart />
        <StoreTrendChart />
      </section>

      <section>
        <StoreRankingTable />
      </section>
    </div>
  );
}
