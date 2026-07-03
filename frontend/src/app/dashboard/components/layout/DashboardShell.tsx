"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FloatingAiAssistant from "./FloatingAiAssistant";
import { canAccessRoute, defaultRouteByRole, routesForRole } from "@/config/roleAccess";
import { usePosStore } from "@/stores/posStore";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const role = usePosStore((state) => state.role);

  useEffect(() => {
    if (!canAccessRoute(role, pathname)) {
      router.replace(defaultRouteByRole[role]);
      return;
    }

    const prefetchTargets = routesForRole(role)
      .map((route) => route.href)
      .filter((route) => route !== pathname);

    const runPrefetch = () => {
      prefetchTargets.forEach((route) => router.prefetch(route));
    };

    const idleCapableWindow = window as Window &
      Partial<{
        requestIdleCallback: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions
        ) => number;
        cancelIdleCallback: (handle: number) => void;
      }>;

    if (idleCapableWindow.requestIdleCallback) {
      const idleId = idleCapableWindow.requestIdleCallback(runPrefetch, {
        timeout: 1500,
      });

      return () => {
        idleCapableWindow.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = setTimeout(runPrefetch, 250);
    return () => clearTimeout(timeoutId);
  }, [pathname, role, router]);

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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900 shadow-sm">
            This is a demo simulation and does not represent an actual production company product.
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4 lg:px-6 lg:py-4">
            <Navbar
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />
          </div>

          <main className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      <FloatingAiAssistant />
    </div>
  );
}
