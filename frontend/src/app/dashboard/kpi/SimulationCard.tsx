"use client";

import { useSimulation } from "@/hooks/useSimulation";
import { formatCurrency } from "@/lib/format";

export default function SimulationCard() {
  const { data, isLoading, isError } = useSimulation();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-red-500 shadow-sm">
        Failed to load simulation outlook
      </div>
    );
  }

  const netBenefitTone =
    data.uplift.netBenefit >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
            Simulation Outlook
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">
            Projected impact if the current transfers are executed
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {data.totalRecommendations} prioritized transfers modeled over{" "}
            {data.planningAssumptions.horizonDays} days using{" "}
            {data.planningAssumptions.velocityWindowDays}-day demand history.
            Current source:{" "}
            {data.planningAssumptions.demandSignalSource.replaceAll("_", " ")}
            {" "}at{" "}
            {(data.planningAssumptions.averageDemandConfidence * 100).toFixed(0)}
            % confidence.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Net Benefit
          </p>
          <p className={`mt-2 text-2xl font-bold ${netBenefitTone}`}>
            {formatCurrency(data.uplift.netBenefit)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <Metric
          label="Revenue Increase"
          value={formatCurrency(data.uplift.revenueIncrease)}
        />
        <Metric
          label="Margin Increase"
          value={formatCurrency(data.uplift.marginIncrease)}
        />
        <Metric
          label="Lost Sales Recovered"
          value={data.uplift.lostSalesRecovered.toLocaleString()}
        />
        <Metric
          label="Deadstock Reduced"
          value={data.uplift.deadStockReduction.toLocaleString()}
        />
        <Metric
          label="Capital Freed"
          value={formatCurrency(data.uplift.deadStockValueRecovered)}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Metric
          label="Transfer Cost"
          value={formatCurrency(data.uplift.transferCost)}
        />
        <Metric
          label="Moved Units"
          value={data.uplift.transferredUnits.toLocaleString()}
        />
        <Metric
          label="Moved Inventory Cost"
          value={formatCurrency(data.uplift.transferredInventoryCost)}
        />
        <Metric
          label="Revenue At Risk"
          value={formatCurrency(data.baseline.revenueAtRisk)}
        />
        <Metric
          label="Model-Ready Coverage"
          value={`${data.planningAssumptions.modelReadyCoveragePct.toFixed(0)}%`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScenarioBlock
          title="Baseline"
          revenue={data.baseline.revenue}
          margin={data.baseline.margin}
          marginPct={data.baseline.grossMarginPct}
          deadUnits={data.baseline.deadUnits}
          lostSalesUnits={data.baseline.lostSalesUnits}
          deadStockValue={data.baseline.deadStockValue}
          revenueAtRisk={data.baseline.revenueAtRisk}
        />
        <ScenarioBlock
          title="Post Transfer"
          revenue={data.postTransfer.revenue}
          margin={data.postTransfer.margin}
          marginPct={data.postTransfer.grossMarginPct}
          deadUnits={data.postTransfer.deadUnits}
          lostSalesUnits={data.postTransfer.lostSalesUnits}
          deadStockValue={data.postTransfer.deadStockValue}
          revenueAtRisk={data.postTransfer.revenueAtRisk}
        />
      </div>
    </div>
  );
}

function Metric({
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

function ScenarioBlock({
  title,
  revenue,
  margin,
  marginPct,
  deadUnits,
  lostSalesUnits,
  deadStockValue,
  revenueAtRisk,
}: {
  title: string;
  revenue: number;
  margin: number;
  marginPct: number;
  deadUnits: number;
  lostSalesUnits: number;
  deadStockValue: number;
  revenueAtRisk: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <MiniMetric label="Revenue" value={formatCurrency(revenue)} />
        <MiniMetric label="Margin" value={formatCurrency(margin)} />
        <MiniMetric label="Gross Margin" value={`${marginPct.toFixed(1)}%`} />
        <MiniMetric label="Dead Units" value={deadUnits.toLocaleString()} />
        <MiniMetric label="Deadstock Value" value={formatCurrency(deadStockValue)} />
        <MiniMetric
          label="Lost Sales"
          value={lostSalesUnits.toLocaleString()}
        />
        <MiniMetric label="Revenue At Risk" value={formatCurrency(revenueAtRisk)} />
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
