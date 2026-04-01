import type { ReactNode } from "react";
import DashboardShell from "../dashboard/components/layout/DashboardShell";

export default function DecisionLabLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
