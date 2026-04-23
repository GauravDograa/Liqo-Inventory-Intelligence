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
        description="A command view for commercial performance, inventory pressure, and AI-guided actions, with the assistant now available from the floating button on every core workspace."
        accent="slate"
      />

      <InsightsKPIs />
      <AiInsightsPanel />
    </div>
  );
}
