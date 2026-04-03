"use client";

import { Menu } from "lucide-react";

export default function Navbar({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 sm:min-h-16 sm:gap-4">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <input
          placeholder="Search..."
          className="w-full min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 sm:max-w-64 lg:max-w-80"
        />
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">

        {/* Hide text on small screens */}
        <button className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block">
          Notifications
        </button>

        {/* Icon for mobile */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 sm:hidden"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="text-sm font-medium text-slate-700 whitespace-nowrap">
          My Hub
        </div>
      </div>
    </div>
  );
}
