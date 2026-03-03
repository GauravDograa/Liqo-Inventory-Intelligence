"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

import KPISection from "@/app/dashboard/kpi/KPISection";
import RevenueLineChart from "@/app/dashboard/charts/RevenueLineChart";
import CategoryPieChart from "@/app/dashboard/charts/CategoryPieChart";
import StorePerformanceChart from "@/app/dashboard/charts/StorePerformanceChart";
import StoreMovementCard from "@/app/dashboard/cards/StoreMovementCard";
import DeadstockTable from "@/app/dashboard/tables/DeadstockTable";
import RecommendationsTable from "@/app/dashboard/tables/RecommendationsTable";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call any protected route
        await api.get("/dashboard");
        setLoading(false);
      } catch (error) {
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Real-time performance insights across revenue, profitability,
              and inventory risk exposure.
            </p>
          </div>
        </div>
      </div>

      <KPISection />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-2">
          <RevenueLineChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryPieChart />
            <StorePerformanceChart />
          </div>
        </div>

        <div className="lg:col-span-1">
          <StoreMovementCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeadstockTable />
        <RecommendationsTable />
      </div>
    </div>
  );
}