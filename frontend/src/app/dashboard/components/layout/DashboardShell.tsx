"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const appRoutes = [
  "/dashboard",
  "/deadstock",
  "/store-performance",
  "/inventory",
  "/recommendations",
  "/insights",
  "/import",
  "/settings",
  "/help",
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const prefetchTargets = appRoutes.filter((route) => route !== pathname);

    const runPrefetch = () => {
      prefetchTargets.forEach((route) => router.prefetch(route));
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(runPrefetch, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(runPrefetch, 250);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:ml-[130px]" : "lg:ml-[300px]"
        } px-3 py-3 sm:px-4 sm:py-4 lg:p-6`}
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4 lg:px-6 lg:py-4">
            <Navbar
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
