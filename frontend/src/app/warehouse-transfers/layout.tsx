import type { ReactNode } from "react";
import DashboardShell from "../dashboard/components/layout/DashboardShell";

export default function WarehouseLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
