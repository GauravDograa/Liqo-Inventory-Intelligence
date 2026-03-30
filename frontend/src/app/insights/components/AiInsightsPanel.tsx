"use client";

import { FormEvent, useState } from "react";
import {
  Sparkles,
  TriangleAlert,
  ArrowRightLeft,
  MessagesSquare,
  SendHorizonal,
} from "lucide-react";
import { useAiInsightsSummary } from "@/hooks/useAiInsightsSummary";
import { useAskAiInsights } from "@/hooks/useAskAiInsights";

export default function AiInsightsPanel() {
  const { data, isLoading, error } = useAiInsightsSummary();
  const askMutation = useAskAiInsights();
  const [question, setQuestion] = useState("");
  const [latestQuestion, setLatestQuestion] = useState("");

  const handleAsk = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    setLatestQuestion(trimmedQuestion);
    askMutation.mutate(trimmedQuestion);
    setQuestion("");
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Generating AI executive summary...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm text-red-600">
        Failed to generate AI insights
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              <Sparkles size={14} />
              AI Executive Summary
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              What the business should focus on next
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Source: {data.source}
          </span>
        </div>

        <p className="mt-6 text-base leading-8 text-slate-600">{data.summary}</p>
      </div>

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
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <MessagesSquare size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Ask Liqo AI</h3>
          </div>

          <form onSubmit={handleAsk} className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {data.followUpQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuestion(item)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                >
                  {item}
                </button>
              ))}
            </div>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about margin, deadstock, store performance, or transfer actions..."
              className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
            />

            <button
              type="submit"
              disabled={askMutation.isPending || !question.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <SendHorizonal size={16} />
              {askMutation.isPending ? "Thinking..." : "Ask AI"}
            </button>
          </form>

          {askMutation.isError ? (
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              Failed to get AI answer
            </div>
          ) : null}

          {askMutation.data ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {latestQuestion ? `Question: ${latestQuestion}` : "Latest answer"}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {askMutation.data.answer}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                Source: {askMutation.data.source}
              </p>
            </div>
          ) : null}
        </div>
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
  icon: React.ReactNode;
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
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
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
