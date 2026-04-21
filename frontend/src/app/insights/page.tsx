import dynamic from "next/dynamic";
import SectionHero from "@/components/analytics/SectionHero";
import {
  CardGridSkeleton,
  PanelSkeleton,
} from "@/components/ui/RouteSkeletons";

const InsightsKPIs = dynamic(() => import("./components/InsightsKPIs"), {
  loading: () => <CardGridSkeleton />,
});

const AiInsightsPanel = dynamic(() => import("./components/AiInsightsPanel"), {
  loading: () => <PanelSkeleton className="h-[32rem]" />,
});

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
