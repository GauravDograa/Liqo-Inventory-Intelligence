"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Boxes,
  Sparkles,
  Brain,
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Warehouse,
  ReceiptText,
  MonitorCog,
} from "lucide-react";
import { appRoutes, RouteAccess } from "@/config/roleAccess";
import { usePosStore } from "@/stores/posStore";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}

const routeIcons: Record<RouteAccess["key"], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  "store-operations": MonitorCog,
  pos: ShoppingCart,
  deadstock: Package,
  "store-performance": BarChart3,
  inventory: Boxes,
  "warehouse-transfers": Warehouse,
  invoices: ReceiptText,
  recommendations: Sparkles,
  "decision-lab": Brain,
  insights: Brain,
  import: Upload,
  settings: Settings,
  help: HelpCircle,
  logout: LogOut,
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = usePosStore((state) => state.role);
  const allowedRoutes = appRoutes.filter((route) => route.roles.includes(role));
  const operationItems = allowedRoutes.filter((route) => route.navGroup === "operations");
  const analyticsItems = allowedRoutes.filter((route) => route.navGroup === "analytics");
  const generalItems = allowedRoutes.filter((route) => route.navGroup === "general");

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[88vw] max-w-72 border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 sm:max-w-80 lg:left-6 lg:top-6 lg:bottom-6 lg:max-w-none lg:rounded-3xl lg:border lg:bg-gray-100 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[90px]" : "lg:w-[260px]"} lg:translate-x-0`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">

        <div className="mb-8 flex items-center justify-between">
          {(!collapsed || mobileMenuOpen) && (
            <Image
              src="/image.png"
              alt="Liqo Logo"
              width={120}
              height={40}
              className="h-auto w-auto object-contain"
            />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
              aria-label="Close navigation menu"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 transition hover:bg-slate-100 lg:block"
              aria-label="Toggle sidebar width"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>
        </div>

        <div>
          {(!collapsed || mobileMenuOpen) && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
          )}

          <div className="space-y-2">
            {[...operationItems, ...analyticsItems].map((item) => {
              const active = pathname === item.href;
              const Icon = routeIcons[item.key];

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  onMouseEnter={() => router.prefetch(item.href)}
                  onFocus={() => router.prefetch(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-slate-200 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />
                  {(!collapsed || mobileMenuOpen) && (
                    <span>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          {(!collapsed || mobileMenuOpen) && (
            <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
              General
            </p>
          )}

          <div className="space-y-2">
            {generalItems.map((item) => {
              const Icon = routeIcons[item.key];

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  onMouseEnter={() => router.prefetch(item.href)}
                  onFocus={() => router.prefetch(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <Icon size={18} />
                  {(!collapsed || mobileMenuOpen) && (
                    <span>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
