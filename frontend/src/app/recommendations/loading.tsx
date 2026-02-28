export default function RecommendationsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-28 rounded-3xl bg-orange-100" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="h-24 rounded-3xl bg-gray-200" />
        <div className="h-24 rounded-3xl bg-gray-200" />
        <div className="h-24 rounded-3xl bg-gray-200" />
        <div className="h-24 rounded-3xl bg-gray-200" />
      </div>

      <div className="h-80 rounded-3xl bg-gray-200" />
      <div className="h-96 rounded-3xl bg-gray-200" />
    </div>
  );
}