"use client";

import { useMemo, useState } from "react";
import { useSimulationComparison } from "@/hooks/useSimulationComparison";
import { formatCurrency } from "@/lib/format";
import { SimulationResult } from "@/types/simulation.types";

type RankingMetric =
  | "netBenefit"
  | "capitalFreed"
  | "deadStockReduction"
  | "averageDemandConfidence";

const rankingOptions: Array<{
  id: RankingMetric;
  label: string;
}> = [
  { id: "netBenefit", label: "Net Benefit" },
  { id: "capitalFreed", label: "Capital Freed" },
  { id: "deadStockReduction", label: "Deadstock Reduced" },
  { id: "averageDemandConfidence", label: "Model Confidence" },
];

export default function ModelSimulationComparison() {
  const [rankingMetric, setRankingMetric] =
    useState<RankingMetric>("netBenefit");
  const { data, isLoading, isError } = useSimulationComparison();

  const rankedItems = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.items].sort((left, right) => {
      const rightValue = getMetricValue(right.result, rankingMetric);
      const leftValue = getMetricValue(left.result, rankingMetric);
      return rightValue - leftValue;
    });
  }, [data, rankingMetric]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-red-500 shadow-sm">
        Failed to load model simulation comparison
      </div>
    );
  }

  const topModel = rankedItems[0];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            Multi-Model Simulation
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">
            Compare transfer impact across all three forecast models
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Rank the simulations by the metric that matters most to you, then
            compare whether the operational decision changes when the forecast
            model changes.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current Leader
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {topModel?.label ?? "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ranked by {formatRankingLabel(rankingMetric)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {rankingOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setRankingMetric(option.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              rankingMetric === option.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {rankedItems.map((item, index) => (
          <ModelCard
            key={item.modelName}
            rank={index + 1}
            label={item.label}
            isLeader={index === 0}
            result={item.result}
            rankingMetric={rankingMetric}
          />
        ))}
      </div>
    </div>
  );
}

function ModelCard({
  rank,
  label,
  isLeader,
  result,
  rankingMetric,
}: {
  rank: number;
  label: string;
  isLeader: boolean;
  result: SimulationResult;
  rankingMetric: RankingMetric;
}) {
  const netBenefitTone =
    result.uplift.netBenefit >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        isLeader
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Rank {rank}
          </p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">
            {label}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {result.planningAssumptions.modelName ||
              result.planningAssumptions.demandSignalSource}
          </p>
        </div>
        {isLeader ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Best on {formatRankingLabel(rankingMetric)}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <ComparisonMetric
          label="Net Benefit"
          value={formatCurrency(result.uplift.netBenefit)}
          tone={netBenefitTone}
        />
        <ComparisonMetric
          label="Capital Freed"
          value={formatCurrency(result.uplift.deadStockValueRecovered)}
        />
        <ComparisonMetric
          label="Deadstock Reduced"
          value={result.uplift.deadStockReduction.toLocaleString()}
        />
        <ComparisonMetric
          label="Confidence"
          value={`${(
            result.planningAssumptions.averageDemandConfidence * 100
          ).toFixed(0)}%`}
        />
        <ComparisonMetric
          label="Revenue Increase"
          value={formatCurrency(result.uplift.revenueIncrease)}
        />
        <ComparisonMetric
          label="Moves"
          value={result.totalRecommendations.toLocaleString()}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reading Note
        </p>
        <p className="mt-2 text-sm text-slate-600">
          This model projects{" "}
          <span className="font-semibold text-slate-900">
            {formatCurrency(result.uplift.netBenefit)}
          </span>{" "}
          in net benefit with{" "}
          <span className="font-semibold text-slate-900">
            {result.uplift.deadStockReduction.toLocaleString()}
          </span>{" "}
          dead units reduced.
        </p>
      </div>
    </div>
  );
}

function ComparisonMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold text-slate-900 ${tone || ""}`}>
        {value}
      </p>
    </div>
  );
}

function getMetricValue(result: SimulationResult, metric: RankingMetric) {
  switch (metric) {
    case "capitalFreed":
      return result.uplift.deadStockValueRecovered;
    case "deadStockReduction":
      return result.uplift.deadStockReduction;
    case "averageDemandConfidence":
      return result.planningAssumptions.averageDemandConfidence;
    case "netBenefit":
    default:
      return result.uplift.netBenefit;
  }
}

function formatRankingLabel(metric: RankingMetric) {
  switch (metric) {
    case "capitalFreed":
      return "capital freed";
    case "deadStockReduction":
      return "deadstock reduced";
    case "averageDemandConfidence":
      return "model confidence";
    case "netBenefit":
    default:
      return "net benefit";
  }
}
