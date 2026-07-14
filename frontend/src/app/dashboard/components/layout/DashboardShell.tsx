"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FloatingAiAssistant from "./FloatingAiAssistant";
import { canAccessRoute, defaultRouteByRole, routesForRole } from "@/config/roleAccess";
import { api } from "@/lib/axios";
import { usePosStore } from "@/stores/posStore";
import { UserRole } from "@/types/erp.types";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const role = usePosStore((state) => state.role);
  const setRole = usePosStore((state) => state.setRole);
  const resetSession = usePosStore((state) => state.resetSession);

  useEffect(() => {
    let cancelled = false;

    const redirectToLogin = () => {
      resetSession();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    };

    const verifySession = async () => {
      try {
        const response = await api.get<{
          data?: { role?: UserRole };
        }>("/auth/session");

        if (cancelled) return;

        const sessionRole = response.data.data?.role;
        if (sessionRole && sessionRole !== role) {
          setRole(sessionRole);
        }

        setSessionReady(true);
      } catch {
        if (!cancelled) redirectToLogin();
      }
    };

    window.addEventListener("liqo:unauthorized", redirectToLogin);
    void verifySession();

    return () => {
      cancelled = true;
      window.removeEventListener("liqo:unauthorized", redirectToLogin);
    };
  }, [pathname, resetSession, role, router, setRole]);

  useEffect(() => {
    if (!sessionReady) return;

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
  }, [pathname, role, router, sessionReady]);

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm font-semibold text-slate-600">
        Checking secure session...
      </div>
    );
  }

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
