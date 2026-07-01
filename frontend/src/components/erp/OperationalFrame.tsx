"use client";

import { ReactNode } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { usePosStore } from "@/stores/posStore";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function OperationalFrame({
  title,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  eyebrow: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const role = usePosStore((state) => state.role);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" className="gap-2 px-3 py-2 text-sm">
            <ShieldCheck size={16} />
            {role}
          </Badge>
          {actions}
        </div>
      </header>

      {children}
    </div>
  );
}

export function LoadingPanel({ label = "Loading live ERP data" }: { label?: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
      <Loader2 className="mr-2 animate-spin" size={18} />
      {label}
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-red-700">
      <AlertTriangle className="mr-2" size={18} />
      {message}
    </div>
  );
}

export function MetricStrip({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; tone?: "default" | "warn" | "good" }>;
}) {
  return (
    <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="px-4 py-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {metric.label}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              metric.tone === "warn"
                ? "text-amber-600"
                : metric.tone === "good"
                  ? "text-emerald-600"
                  : "text-slate-900"
            }`}
          >
            {metric.value}
          </p>
        </Card>
      ))}
    </section>
  );
}
