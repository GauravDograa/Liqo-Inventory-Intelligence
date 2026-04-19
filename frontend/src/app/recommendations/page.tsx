import SectionHero from "@/components/analytics/SectionHero";
import RecommendationKPIs from "./components/cards/RecommendationKPIs";
import RecommendationImpactChart from "./components/charts/RecommendationImpactChart";
import RecommendationTable from "./components/tables/RecommendationTable";

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
