export default function DeadstockLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  );
}