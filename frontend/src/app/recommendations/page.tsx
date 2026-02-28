import RecommendationKPIs from "./components/cards/RecommendationKPIs";
import RecommendationImpactChart from "./components/charts/RecommendationImpactChart";
import RecommendationTable from "./components/tables/RecommendationTable";

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-3xl p-8 text-white shadow-md">
        <h1 className="text-2xl font-semibold">
          Inventory Redistribution Intelligence
        </h1>
        <p className="text-orange-100 mt-2">
          AI-driven store-to-store optimization engine
        </p>
      </div>

      <RecommendationKPIs />

      <RecommendationImpactChart />

      <RecommendationTable />
    </div>
  );
}