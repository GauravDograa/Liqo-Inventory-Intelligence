import type { ReactNode } from "react";
import DashboardShell from "@/app/dashboard/components/layout/DashboardShell";

export default function StorePerformanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell>
      <div className="px-6 py-6 lg:px-10 lg:py-8">
        <div className="max-w-[1500px] mx-auto space-y-8">
          {children}
        </div>
      </div>
    </DashboardShell>
  );
}