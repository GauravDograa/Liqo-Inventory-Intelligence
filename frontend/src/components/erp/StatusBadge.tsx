export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "DELIVERED" || status === "PAID" || status === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "CANCELLED" || status === "FAILED"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "DISPATCHED" || status === "IN_TRANSIT" || status === "ALLOCATED"
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
