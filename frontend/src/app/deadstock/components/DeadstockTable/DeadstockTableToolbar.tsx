"use client";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function DeadstockTableToolbar({
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

      {/* Search */}
      <div className="relative w-full md:w-96">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by SKU, Store, Category..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-orange-400 
                     focus:border-orange-400 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400">
          <option>Filter by Risk</option>
          <option>High Risk</option>
          <option>Medium Risk</option>
          <option>Low Risk</option>
        </select>

        <select className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400">
          <option>Sort by</option>
          <option>Highest Value</option>
          <option>Oldest Stock</option>
          <option>Highest Risk</option>
        </select>
      </div>
    </div>
  );
}