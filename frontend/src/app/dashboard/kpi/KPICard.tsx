import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
  loading?: boolean;
  href?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  highlight,
  loading,
  href,
}: KPICardProps) {
  if (loading) {
    return (
      <div className="h-[150px] animate-pulse rounded-3xl bg-slate-100 shadow-2xl" />
    );
  }

  const cardContent = (
    <>
      <div className="absolute right-5 top-5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            highlight ? "bg-white/20 text-white" : "bg-orange-50 text-orange-400"
          }`}
        >
          <ArrowUpRight size={18} />
        </div>
      </div>

      <h3
        className={`text-base font-semibold tracking-tight ${
          highlight ? "text-white" : "text-slate-700"
        }`}
      >
        {title}
      </h3>

      <div className="mt-4">
        <span
          className={`text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl ${
            highlight ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </span>
      </div>

      {subtitle ? (
        <p
          className={`mt-3 text-sm font-medium ${
            highlight ? "text-orange-100" : "text-orange-500"
          }`}
        >
          {subtitle}
        </p>
      ) : null}

      {href ? (
        <p
          className={`mt-3 text-xs font-semibold uppercase tracking-[0.16em] ${
            highlight ? "text-white/80" : "text-slate-400"
          }`}
        >
          View details
        </p>
      ) : null}
    </>
  );

  const className = `relative rounded-3xl border p-5 transition-all duration-300 sm:p-6 lg:p-7 ${
    highlight
      ? "border-orange-500 bg-orange-500 text-white shadow-lg"
      : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
  } ${href ? "cursor-pointer hover:-translate-y-0.5" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
}
