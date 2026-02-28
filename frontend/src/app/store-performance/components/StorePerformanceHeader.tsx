export default function StorePerformanceHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-10 py-8 shadow-lg">
      <div className="relative z-10">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight">
          Store Performance Intelligence
        </h1>
        <p className="mt-2 text-orange-100 text-sm">
          Executive-level comparison across retail locations
        </p>
      </div>

      <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 blur-2xl" />
    </div>
  );
}