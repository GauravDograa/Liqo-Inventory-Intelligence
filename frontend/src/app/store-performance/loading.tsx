export default function StorePerformanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-orange-100 rounded-3xl" />
      <div className="grid grid-cols-4 gap-6">
        <div className="h-28 bg-gray-200 rounded-3xl" />
        <div className="h-28 bg-gray-200 rounded-3xl" />
        <div className="h-28 bg-gray-200 rounded-3xl" />
        <div className="h-28 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  );
}