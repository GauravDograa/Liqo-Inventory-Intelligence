import SectionHero from "@/components/analytics/SectionHero";
import InsightsKPIs from "./components/InsightsKPIs";
import AiInsightsPanel from "./components/AiInsightsPanel";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <SectionHero
        eyebrow="Executive Insights"
        title="Executive Insights Dashboard"
        description="A more polished command view for revenue, risk, performance, and AI-guided next actions across the business."
        accent="slate"
      />

      <InsightsKPIs />
      <AiInsightsPanel />
    </div>
  );
}
