"use client";

import dynamic from "next/dynamic";
import {
  HeroSkeleton,
  CardGridSkeleton,
  PanelSkeleton,
  TableSkeleton,
} from "@/components/ui/RouteSkeletons";

const InventoryHeader = dynamic(() => import("./components/InventoryHeader"), {
  loading: () => <HeroSkeleton />,
});

const InventoryKPIs = dynamic(() => import("./kpi/InventoryKPIs"), {
  loading: () => <CardGridSkeleton />,
});

const StockByCategoryChart = dynamic(() => import("./charts/StockByCategoryChart"), {
  loading: () => <PanelSkeleton className="h-80" />,
});

const InventoryAgingChart = dynamic(() => import("./charts/InventoryAgingChart"), {
  loading: () => <PanelSkeleton className="h-80" />,
});

const InventoryTable = dynamic(() => import("./tables/InventoryTable"), {
  loading: () => <TableSkeleton className="h-96" />,
});

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <InventoryHeader />
      <InventoryKPIs />

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <StockByCategoryChart />
        <InventoryAgingChart />
      </section>

      <InventoryTable />
    </div>
  );
}
