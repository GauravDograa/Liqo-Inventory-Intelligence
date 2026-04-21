"use client";

export function HeroSkeleton() {
  return (
    <div className="h-28 animate-pulse rounded-3xl bg-orange-100" />
  );
}

export function CardGridSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-3xl bg-gray-200"
        />
      ))}
    </div>
  );
}

export function PanelSkeleton({
  className = "h-80",
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="h-full animate-pulse">
        <div className="h-5 w-44 rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-64 rounded-full bg-slate-100" />
        <div className="mt-6 h-[calc(100%-4rem)] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export function TableSkeleton({
  className = "h-96",
}: {
  className?: string;
}) {
  return <PanelSkeleton className={className} />;
}
