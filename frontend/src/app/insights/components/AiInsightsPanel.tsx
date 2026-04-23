"use client";

import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Bot,
  CircleAlert,
  ClipboardList,
  Sparkles,
  TriangleAlert,
  ArrowRightLeft,
  MessagesSquare,
} from "lucide-react";
import SurfaceCard from "@/components/analytics/SurfaceCard";
import { useAiInsightsSummary } from "@/hooks/useAiInsightsSummary";

export default function AiInsightsPanel() {
  const { data, isLoading, error } = useAiInsightsSummary();

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Generating AI executive summary...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-red-600 shadow-sm">
        Failed to generate AI insights
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <SurfaceCard
        title="What the business should focus on next"
        subtitle="A sharper executive read on where value is building, where risk is compounding, and what the next operating move should be."
        action={
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Source: {data.source}
          </span>
        }
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          <Sparkles size={14} />
          AI Executive Summary
        </div>

        <p className="mt-6 text-base leading-8 text-slate-600">{data.summary}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <SignalStat
            icon={<CircleAlert size={16} />}
            label="Operational Risk"
            value={`${data.risks.length} live signals`}
            tone="rose"
          />
          <SignalStat
            icon={<ClipboardList size={16} />}
            label="Action Queue"
            value={`${data.actions.length} recommended moves`}
            tone="amber"
          />
          <SignalStat
            icon={<Bot size={16} />}
            label="AI Follow-ups"
            value={`${data.followUpQuestions.length} quick prompts`}
            tone="sky"
          />
        </div>
      </SurfaceCard>

      <div className="space-y-6">
        <InsightListCard
          icon={<TriangleAlert size={18} />}
          title="Key Risks"
          items={data.risks}
          tone="rose"
        />
        <InsightListCard
          icon={<ArrowRightLeft size={18} />}
          title="Recommended Actions"
          items={data.actions}
          tone="amber"
        />
        <InsightListCard
          icon={<MessagesSquare size={18} />}
          title="Suggested Questions"
          items={data.followUpQuestions}
          tone="sky"
        />
        <SurfaceCard
          title="Open the assistant"
          subtitle="Launch the floating copilot from here and keep it with you while you move across dashboards."
          className="bg-[linear-gradient(180deg,_#ffffff_0%,_#fff7ed_100%)]"
        >
          <div className="flex flex-wrap gap-3">
            {data.followUpQuestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("liqo-ai:open", {
                      detail: { question: item },
                    })
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                {item}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

function InsightListCard({
  icon,
  title,
  items,
  tone,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  tone: "rose" | "amber" | "sky";
}) {
  const toneClasses = {
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "rose" | "amber" | "sky";
}) {
  const toneClasses = {
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
