"use client";

export default function Navbar() {
  return (
    <div className="  h-16 bg-gray-100 border-b border-slate-200 flex items-center justify-between px-6">
      <input
        placeholder="Search..."
        className="w-80 px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      <div className="flex items-center gap-4">
        <button className="text-sm text-slate-600 hover:text-slate-900">
          Notifications
        </button>
        <div className="text-sm font-medium text-slate-700">
          My Hub
        </div>
      </div>
    </div>
  );
}
