"use client";

import { useRecommendations } from "@/hooks/useRecommendations";
import RecommendationKPICard from "./RecommendationKPICard";

export default function RecommendationKPIs() {
  const { data = [], isLoading } = useRecommendations();

  if (isLoading) return null;

  const totalRecommendations = data.length;

  const totalUnitsToMove = data.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const highImpactMoves = data.filter(
    (item) => item.impact.demandCoverageDays > 300
  ).length;

  const highImpactPercent =
    totalRecommendations > 0
      ? Math.round(
          (highImpactMoves / totalRecommendations) * 100
        )
      : 0;

  const uniqueCategories = new Set(
    data.map((item) => item.skuCategory)
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <RecommendationKPICard
        label="Total Recommendations"
        value={totalRecommendations.toLocaleString()}
      />

      <RecommendationKPICard
        label="Units to Reallocate"
        value={totalUnitsToMove.toLocaleString()}
      />

      <RecommendationKPICard
        label="High Impact Moves"
        value={`${highImpactPercent}%`}
      />

      <RecommendationKPICard
        label="Categories Affected"
        value={uniqueCategories.toString()}
      />
    </div>
  );
}