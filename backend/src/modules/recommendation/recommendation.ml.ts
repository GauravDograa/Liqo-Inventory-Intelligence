export interface RecommendationFeatureSnapshot {
  currentUnits: number;
  sourceCoverageDays: number;
  destinationCoverageDays: number;
  sourceVelocityPerDay: number;
  destinationVelocityPerDay: number;
  stockAgeDays: number;
  grossMarginPct?: number | null;
  demandSource?: string;
  sourceDemandConfidence?: number;
  destinationDemandConfidence?: number;
}

export interface RecommendationMlSignals {
  confidence: number;
  rankingScore: number;
  readyForModel: boolean;
}

export function buildRecommendationMlSignals(input: {
  sourceCoverageDays: number;
  destinationCoverageDays: number;
  transferQty: number;
  destinationVelocityPerDay: number;
  stockAgeDays: number;
  grossMarginPct?: number | null;
  imbalanceBefore?: number;
  destinationDemandConfidence?: number;
}): RecommendationMlSignals {
  const shortageWeight = Math.min(
    input.destinationCoverageDays <= 0
      ? 1
      : input.transferQty /
          Math.max(input.destinationCoverageDays * input.destinationVelocityPerDay, 1),
    1
  );
  const agingWeight = Math.min(input.stockAgeDays / 180, 1);
  const velocityWeight = Math.min(input.destinationVelocityPerDay / 3, 1);
  const quantityWeight = Math.min(input.transferQty / 20, 1);
  const marginWeight = Math.min((input.grossMarginPct || 0) / 100, 1);
  const imbalanceWeight = Math.min((input.imbalanceBefore || 0) / 30, 1);
  const confidenceWeight = Math.min(
    input.destinationDemandConfidence || 0,
    1
  );

  const rankingScore = Number(
    (
      shortageWeight * 0.22 +
      agingWeight * 0.2 +
      velocityWeight * 0.16 +
      quantityWeight * 0.12 +
      marginWeight * 0.1 +
      imbalanceWeight * 0.1 +
      confidenceWeight * 0.1
    ).toFixed(3)
  );

  return {
    confidence: Number(
      (0.5 + rankingScore * 0.3 + confidenceWeight * 0.15).toFixed(3)
    ),
    rankingScore,
    readyForModel: true,
  };
}
