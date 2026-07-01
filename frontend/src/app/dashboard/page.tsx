"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Boxes, ChartNoAxesCombined, ReceiptText, ShoppingCart, Warehouse } from "lucide-react";
import KPISection from "@/app/dashboard/kpi/KPISection";
import { usePosStore } from "@/stores/posStore";
import { useErpAnalyticsSummary } from "@/hooks/useErp";
import { formatCurrency } from "@/lib/format";

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
  const role = usePosStore((state) => state.role);
  const roleContext = roleDashboardCopy[role] ?? roleDashboardCopy.ADMIN;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {roleContext.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
              {roleContext.description}
            </p>
          </div>
        </div>
      </div>

      <RoleWorkspace role={role} />

      <LiveErpAnalyticsStrip />

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

function LiveErpAnalyticsStrip() {
  const { data, isLoading, isError } = useErpAnalyticsSummary();

  const sales = data?.dailySales ?? [];
  const latestSales = sales[0];
  const inventory = data?.inventoryHealth?.[0];
  const transferCount = (data?.transferPipeline ?? []).reduce((sum, item) => sum + item.count, 0);
  const forecastCount = data?.forecasts?.length ?? 0;
  const gstTotal = (data?.gst ?? []).reduce((sum, item) => sum + Number(item.gstTotal ?? 0), 0);

  const cards = [
    {
      label: "Transactions",
      value: isLoading ? "..." : `${latestSales?.transactionCount ?? 0}`,
      detail: "Live POS sales feeding analytics",
    },
    {
      label: "Invoices / GST",
      value: isLoading ? "..." : formatCurrency(gstTotal),
      detail: "Invoice engine and tax summaries",
    },
    {
      label: "Inventory",
      value: isLoading ? "..." : `${inventory?.totalQuantityAvailable ?? 0}`,
      detail: `${inventory?.lowStockCount ?? 0} low-stock signals`,
    },
    {
      label: "Transfers",
      value: isLoading ? "..." : `${transferCount}`,
      detail: "Warehouse lifecycle in analytics scope",
    },
    {
      label: "Forecasts",
      value: isLoading ? "..." : `${forecastCount}`,
      detail: "Rule-based demand outputs",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Live ERP data connection</h2>
          <p className="text-xs text-slate-500">
            Analytics is wired to transactions, invoices, inventory, transfers, and forecasts.
          </p>
        </div>
        {isError ? <span className="text-xs font-medium text-red-600">ERP analytics unavailable</span> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const roleDashboardCopy = {
  OWNER: {
    title: "LIQO Retail Operations Intelligence Platform",
    description: "Company-wide intelligence across sales, stock, transfers, forecasts, and recommendations.",
  },
  ADMIN: {
    title: "LIQO Retail Operations Intelligence Platform",
    description: "Company-wide intelligence across sales, stock, transfers, forecasts, and recommendations.",
  },
  STORE_MANAGER: {
    title: "Store Manager Dashboard",
    description: "Store operations, inventory pressure, billing performance, and local replenishment priorities.",
  },
  ANALYST: {
    title: "Analyst Dashboard",
    description: "Read-only analytics, forecasting, recommendations, and KPI monitoring from live ERP data.",
  },
  CASHIER: {
    title: "Cashier Workspace",
    description: "Fast selling, billing, and invoice reprint workflows.",
  },
  WAREHOUSE_MANAGER: {
    title: "Warehouse Dashboard",
    description: "Transfer pipeline, dispatch, receiving, and replenishment control.",
  },
};

function RoleWorkspace({ role }: { role: keyof typeof roleDashboardCopy }) {
  const cards =
    role === "STORE_MANAGER"
      ? [
          { href: "/store-operations", icon: ChartNoAxesCombined, label: "Store Ops", detail: "Low stock, inbound transfers, shift command" },
          { href: "/pos", icon: ShoppingCart, label: "POS", detail: "Counter sales and billing" },
          { href: "/inventory", icon: Boxes, label: "Inventory", detail: "Health, alerts, and stock cover" },
        ]
      : role === "ANALYST"
        ? [
            { href: "/store-performance", icon: ChartNoAxesCombined, label: "Store Analytics", detail: "Revenue and margin trends" },
            { href: "/recommendations", icon: Boxes, label: "Recommendations", detail: "Rule-based operating suggestions" },
            { href: "/insights", icon: ReceiptText, label: "Insights", detail: "Executive and AI summaries" },
          ]
        : [
            { href: "/store-operations", icon: ChartNoAxesCombined, label: "Operations", detail: "Stores, alerts, transfers, and execution" },
            { href: "/warehouse-transfers", icon: Warehouse, label: "Warehouse", detail: "Dispatch, receiving, and replenishment" },
            { href: "/invoices", icon: ReceiptText, label: "Financials", detail: "GST invoices and payment audit trail" },
          ];

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40"
          >
            <div className="flex items-center justify-between">
              <Icon className="text-orange-500" size={22} />
              <ArrowRight className="text-slate-400 group-hover:text-orange-500" size={18} />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">{card.label}</h2>
            <p className="mt-1 text-sm text-slate-500">{card.detail}</p>
          </Link>
        );
      })}
    </section>
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
