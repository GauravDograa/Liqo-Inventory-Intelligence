import dynamic from "next/dynamic";
import SectionHero from "@/components/analytics/SectionHero";
import {
  CardGridSkeleton,
  PanelSkeleton,
  TableSkeleton,
} from "@/components/ui/RouteSkeletons";

const RecommendationKPIs = dynamic(
  () => import("./components/cards/RecommendationKPIs"),
  {
    loading: () => <CardGridSkeleton />,
  }
);

const RecommendationImpactChart = dynamic(
  () => import("./components/charts/RecommendationImpactChart"),
  {
    loading: () => <PanelSkeleton className="h-80" />,
  }
);

const RecommendationTable = dynamic(
  () => import("./components/tables/RecommendationTable"),
  {
    loading: () => <TableSkeleton className="h-96" />,
  }
);

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <SectionHero
        eyebrow="Recommendations"
        title="Inventory Redistribution Intelligence"
        description="Turn overstock into opportunity with cleaner transfer signals, category-level impact, and a more readable action queue."
        accent="amber"
      />

      <RecommendationKPIs />

      <RecommendationImpactChart />

      <RecommendationTable />
    </div>
  );
}
