export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="animate-pulse">
          <div className="h-8 w-40 rounded-full bg-slate-200 sm:h-10" />
          <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[140px] animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="space-y-4 lg:col-span-3 lg:space-y-6">
          <DashboardPanelSkeleton className="h-[320px] sm:h-[400px]" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <DashboardPanelSkeleton className="h-[360px] sm:h-[420px]" />
            <DashboardPanelSkeleton className="h-[360px] sm:h-[420px]" />
          </div>
        </div>

        <DashboardPanelSkeleton className="min-h-[420px] lg:h-[842px]" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <DashboardPanelSkeleton className="min-h-[360px] lg:h-[500px]" />
        <DashboardPanelSkeleton className="min-h-[360px] lg:h-[500px]" />
      </div>
    </div>
  );
}

function DashboardPanelSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="h-full animate-pulse">
        <div className="h-5 w-40 rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-56 rounded-full bg-slate-100" />
        <div className="mt-6 h-[calc(100%-4rem)] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
