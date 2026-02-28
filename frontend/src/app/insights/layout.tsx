import type { ReactNode } from "react";
import DashboardShell from "@/app/dashboard/components/layout/DashboardShell";

export default function InsightsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}