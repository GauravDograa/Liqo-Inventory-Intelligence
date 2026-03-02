"use client";

export default function Navbar() {
  return (
    <div className="h-16 bg-gray-100 border-b border-slate-200 
                    flex items-center justify-between 
                    px-4 lg:px-6 gap-4">

      {/* ===== LEFT SIDE ===== */}
      <div className="flex items-center gap-4 flex-1">

        {/* Search - Responsive Width */}
        <input
          placeholder="Search..."
          className="w-full sm:w-64 lg:w-80 
                     px-4 py-2 text-sm 
                     border border-slate-300 
                     rounded-lg 
                     focus:outline-none 
                     focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex items-center gap-3 lg:gap-4 shrink-0">

        {/* Hide text on small screens */}
        <button className="hidden sm:block text-sm text-slate-600 hover:text-slate-900">
          Notifications
        </button>

        {/* Icon for mobile */}
        <button className="sm:hidden text-xl">
          🔔
        </button>

        <div className="text-sm font-medium text-slate-700 whitespace-nowrap">
          My Hub
        </div>
      </div>
    </div>
  );
}