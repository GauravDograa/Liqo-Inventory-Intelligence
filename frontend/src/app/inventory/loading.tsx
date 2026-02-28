export default function InventoryLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-28 rounded-3xl bg-orange-100" />

      {/* KPI Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="h-24 rounded-3xl bg-gray-200" />
        <div className="h-24 rounded-3xl bg-gray-200" />
        <div className="h-24 rounded-3xl bg-gray-200" />
        <div className="h-24 rounded-3xl bg-gray-200" />
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <div className="h-80 rounded-3xl bg-gray-200" />
        <div className="h-80 rounded-3xl bg-gray-200" />
      </div>

      {/* Table Skeleton */}
      <div className="h-96 rounded-3xl bg-gray-200" />
    </div>
  );
}