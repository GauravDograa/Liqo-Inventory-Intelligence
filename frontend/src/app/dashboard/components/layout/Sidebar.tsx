"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Boxes,
  Sparkles,
  Brain,
  FlaskConical,
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Decision Lab", href: "/decision-lab", icon: FlaskConical },
  { name: "Deadstock", href: "/deadstock", icon: Package },
  { name: "Store Performance", href: "/store-performance", icon: BarChart3 },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Recommender", href: "/recommendations", icon: Sparkles },
  { name: "Insights", href: "/insights", icon: Brain },
  { name: "Import", href: "/import", icon: Upload },
];

const generalItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Logout", href: "/logout", icon: LogOut },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed lg:left-6 lg:top-6 lg:bottom-6
        inset-y-0 left-0
        z-50
        ${collapsed ? "lg:w-[90px]" : "lg:w-[260px]"}
        w-64
        bg-gray-100
        lg:rounded-3xl
        shadow-xl
        border border-gray-200
        flex flex-col
        transition-all duration-300
      `}
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto">

        {/* Logo + Collapse */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <Image
              src="/image.png"
              alt="Liqo Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          )}

          {/* Collapse only on desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 transition"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* MENU */}
        <div>
          {!collapsed && (
            <p className="hidden lg:block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Menu
            </p>
          )}

          <div className="space-y-2">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                    active
                      ? "bg-slate-200 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />
                  {!collapsed && (
                    <span className="hidden lg:inline">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* GENERAL */}
        <div className="mt-auto">
          {!collapsed && (
            <p className="hidden lg:block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-8">
              General
            </p>
          )}

          <div className="space-y-2">
            {generalItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  <Icon size={18} />
                  {!collapsed && (
                    <span className="hidden lg:inline">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
