"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white min-h-screen">

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Area */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "ml-[130px]" : "ml-[300px]"
        } p-6 space-y-2`}
      >

        {/* ===== TOP NAVBAR CARD ===== */}
        <div className="bg-gray-100 rounded-2xl shadow-sm border border-slate-200 px-6 py-4">
          <Navbar />
        </div>

        {/* ===== MAIN DASHBOARD CARD ===== */}
        <div className="bg-gray-100 rounded-2xl shadow-sm border border-slate-200 p-6">
          {children}
        </div>

      </div>
    </div>
  );
}