import type { ReactNode } from "react";
import DashboardShell from "../dashboard/components/layout/DashboardShell";

export default function PosLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
