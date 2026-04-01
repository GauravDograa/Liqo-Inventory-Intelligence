"use client";

import { useState } from "react";
import SimulationCard from "@/app/dashboard/kpi/SimulationCard";
import MlForecastStatusCard from "@/app/dashboard/kpi/MlForecastStatusCard";
import ModelSimulationComparison from "./ModelSimulationComparison";

type DecisionTab = "overview" | "simulation" | "governance" | "compare";

const tabs: Array<{
  id: DecisionTab;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    title: "What should I do here?",
    description:
      "Use this page to validate transfer impact first, then confirm the forecast model behind the recommendation logic.",
  },
  {
    id: "simulation",
    label: "Simulation",
    title: "Should we execute the transfers?",
    description:
      "Read the projected benefit, deadstock reduction, and capital freed before you act on redistribution.",
  },
  {
    id: "governance",
    label: "ML Governance",
    title: "Can I trust the forecast layer?",
    description:
      "Check which model won, how it scored, and whether the winner has changed across retraining runs.",
  },
  {
    id: "compare",
    label: "Compare",
    title: "Decision and model view together",
    description:
      "Use the side-by-side layout when you want to connect operational impact with model-selection quality.",
  },
];

export default function DecisionLabWorkspace() {
  const [activeTab, setActiveTab] = useState<DecisionTab>("overview");
  const activeConfig =
    tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,178,107,0.38),_transparent_30%),linear-gradient(135deg,#10203a_0%,#17325e_55%,#245d72_100%)] p-8 text-white shadow-lg">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
            Decision Lab
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Simulation and forecast governance, together
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100">
            This workspace separates execution planning from the main dashboard.
            Use it to understand two questions clearly: whether the transfers
            create business value, and whether the forecast model supporting
            planning is the right one to trust.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <GuideCard
            step="1"
            title="Read the simulation"
            body="Start with projected benefit, deadstock reduction, and capital freed to understand operational upside."
          />
          <GuideCard
            step="2"
            title="Check model stability"
            body="Confirm the active winner, compare holdout scores, and note whether retraining has changed the selected model."
          />
          <GuideCard
            step="3"
            title="Make the decision"
            body="If impact is strong and model stability is acceptable, the transfer plan is easier to defend in college or company reviews."
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab.id === activeTab
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Current Focus
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            {activeConfig.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            {activeConfig.description}
          </p>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SimulationCard />
          </div>
          <div className="space-y-6">
            <ActionPanel />
            <MlForecastStatusCard />
          </div>
        </div>
      ) : null}

      {activeTab === "simulation" ? (
        <div className="space-y-6">
          <InsightPanel
            title="How to read the simulation"
            bullets={[
              "Start with net benefit, capital freed, and deadstock reduced. Those are the easiest operational signals to explain.",
              "If revenue increase stays near zero while capital freed is strong, the transfer plan is mainly an inventory cleanup move.",
              "Use baseline versus post-transfer blocks to show what changes and what does not.",
              "Then scroll to the multi-model comparison to see whether Baseline, Challenger, and Lag Trend lead to the same operational conclusion.",
            ]}
          />
          <SimulationCard />
          <ModelSimulationComparison />
        </div>
      ) : null}

      {activeTab === "governance" ? (
        <div className="space-y-6">
          <InsightPanel
            title="How to read ML governance"
            bullets={[
              "The active winner is the model currently selected for inference.",
              "Holdout scoreboard shows which model had the lowest recent error on unseen data.",
              "Winner changes tell you whether model choice is stable or still shifting between retraining runs.",
            ]}
          />
          <MlForecastStatusCard />
        </div>
      ) : null}

      {activeTab === "compare" ? (
        <div className="space-y-6">
          <ModelSimulationComparison />
          <div className="grid gap-6 xl:grid-cols-2">
            <SimulationCard />
            <MlForecastStatusCard />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GuideCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
        Step {step}
      </p>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-100">{body}</p>
    </div>
  );
}

function ActionPanel() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Recommended Reading Order
      </p>
      <div className="mt-4 space-y-4">
        <ActionRow
          title="1. Check net benefit"
          body="This tells you whether the current transfer set is commercially worth discussing."
        />
        <ActionRow
          title="2. Check deadstock reduction"
          body="If this is high, the move is likely helping inventory health even when short-term revenue lift is modest."
        />
        <ActionRow
          title="3. Confirm model winner"
          body="Use the governance card to see which model produced the planning signal and how stable that choice is."
        />
      </div>
    </div>
  );
}

function ActionRow({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}

function InsightPanel({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Reading Guide
      </p>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}
