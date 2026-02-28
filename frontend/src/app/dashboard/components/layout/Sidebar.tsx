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
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Deadstock", href: "/deadstock", icon: Package },
  { name: "Store Performance", href: "/store-performance", icon: BarChart3 },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Recommender", href: "/recommendations", icon: Sparkles },
  { name: "Insights", href: "/insights", icon: Brain },
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
      className={`fixed left-6 top-6 bottom-6 ${
        collapsed ? "w-[90px]" : "w-[260px]"
      } bg-gray-100 rounded-3xl shadow-xl border border-gray-200 flex flex-col justify-between transition-all duration-300`}
    >
      <div className="flex flex-col h-full p-4">

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

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
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
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
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
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* GENERAL */}
        <div>
          {!collapsed && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-8">
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
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}