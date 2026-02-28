import { ArrowUpRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
  loading?: boolean;
}

export default function KPICard({
  title,
  value,
  subtitle,
  highlight,
  loading,
}: KPICardProps) {
  if (loading) {
    return (
      <div className="h-[150px] rounded-3xl bg-slate-100 animate-pulse shadow-2xl" />
    );
  }

  return (
    <div
      className={`relative p-7 rounded-3xl border transition-all duration-300
      ${
        highlight
          ? "bg-orange-500 border-orange-500 text-white shadow-lg"
          : "bg-white border-slate-200 shadow-sm hover:shadow-lg"
      }`}
    >
      {/* Redirect Icon */}
      <div className="absolute top-5 right-5">
        <div
          className={`w-9 h-9 flex items-center justify-center rounded-full
          ${
            highlight
              ? "bg-white/20 text-white"
              : "bg-orange-50 text-orange-400"
          }`}
        >
          <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-base font-semibold tracking-tight ${
          highlight ? "text-white" : "text-slate-700"
        }`}
      >
        {title}
      </h3>

      {/* Value */}
      <div className="mt-4">
        <span
          className={`text-4xl font-bold tracking-tight ${
            highlight ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </span>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`mt-3 text-sm font-medium ${
            highlight
              ? "text-orange-100"
              : "text-orange-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}