"use client";

import { useMlForecastStatus } from "@/hooks/useMlForecastStatus";

const MODEL_LABELS: Record<string, string> = {
  trained_baseline: "Baseline",
  trained_challenger: "Challenger",
  trained_lag_trend: "Lag Trend",
};

export default function MlForecastStatusCard() {
  const { data, isLoading, isError } = useMlForecastStatus();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-red-500 shadow-sm">
        Failed to load ML model status
      </div>
    );
  }

  const { selection, history } = data;
  const winner = selection.winner || "trained_baseline";
  const historyEntries = history.length;
  const winnerChanges = history.reduce((count, entry, index) => {
    if (index === 0) {
      return 0;
    }

    return count + Number(entry.winner !== history[index - 1].winner);
  }, 0);
  const latestRun = history.at(-1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            ML Forecast Governance
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">
            Live winner and retraining stability
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            The inference service defaults to{" "}
            <span className="font-semibold text-slate-700">
              {getModelLabel(winner)}
            </span>{" "}
            based on {formatMetricLabel(selection.selectionMetric)}.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active Winner
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {getModelLabel(winner)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selection.selectedAt
              ? formatDateTime(selection.selectedAt)
              : "Awaiting first evaluation"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatusMetric label="History Entries" value={historyEntries.toString()} />
        <StatusMetric label="Winner Changes" value={winnerChanges.toString()} />
        <StatusMetric
          label="Latest Dataset"
          value={
            latestRun
              ? `${latestRun.dataset.totalRows} rows`
              : "No runs yet"
          }
        />
        <StatusMetric
          label="Selection Metric"
          value={formatMetricLabel(selection.selectionMetric)}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Holdout Scoreboard
          </h4>
          <div className="mt-4 space-y-3">
            {selection.supportedModels.map((modelKey) => (
              <ScoreRow
                key={`holdout-${modelKey}`}
                label={getModelLabel(modelKey)}
                value={getScore(selection.scores, modelKey)}
                highlight={modelKey === winner}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Time-Based Validation
          </h4>
          <div className="mt-4 space-y-3">
            {selection.supportedModels.map((modelKey) => (
              <ScoreRow
                key={`time-${modelKey}`}
                label={getModelLabel(modelKey)}
                value={getScore(selection.timeBasedScores, modelKey)}
                highlight={modelKey === winner}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-5">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent Winner Timeline
        </h4>
        {historyEntries === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No retraining history has been recorded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {history
              .slice(-3)
              .reverse()
              .map((entry) => (
                <div
                  key={entry.selectedAt}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {getModelLabel(entry.winner)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.dataset.totalRows} rows, horizon{" "}
                      {entry.dataset.horizonDays}d
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatScore(getScore(entry.scores, entry.winner))}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(entry.selectedAt)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
        highlight ? "bg-emerald-50" : "bg-slate-50"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-emerald-700" : "text-slate-700"
        }`}
      >
        {label}
      </p>
      <p className="text-sm font-bold text-slate-900">{formatScore(value)}</p>
    </div>
  );
}

function getModelLabel(modelKey: string) {
  return MODEL_LABELS[modelKey] || modelKey.replaceAll("_", " ");
}

function formatMetricLabel(metric?: string) {
  if (!metric) {
    return "holdout MAE";
  }

  return metric.replaceAll("_", " ");
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return value.toFixed(3);
}

function getScore(
  scoreMap: Record<string, number | null>,
  modelKey: string
) {
  return (
    scoreMap[modelKey] ??
    scoreMap[toCamelCase(modelKey)] ??
    null
  );
}

function toCamelCase(value: string) {
  return value.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
