import type { ReactNode } from "react";
import DashboardShell from "@/app/dashboard/components/layout/DashboardShell";

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}