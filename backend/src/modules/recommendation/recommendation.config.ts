export interface CategoryPolicy {
  targetCoverageDays: number;
  safetyCoverageDays: number;
  deadstockThresholdDays: number;
}

const DEFAULT_POLICY: CategoryPolicy = {
  targetCoverageDays: 30,
  safetyCoverageDays: 12,
  deadstockThresholdDays: 90,
};

const CATEGORY_POLICY_MAP: Record<string, Partial<CategoryPolicy>> = {
  refrigerator: {
    targetCoverageDays: 35,
    safetyCoverageDays: 14,
    deadstockThresholdDays: 120,
  },
  "washing machine": {
    targetCoverageDays: 28,
    safetyCoverageDays: 12,
    deadstockThresholdDays: 100,
  },
  tv: {
    targetCoverageDays: 21,
    safetyCoverageDays: 10,
    deadstockThresholdDays: 75,
  },
  ac: {
    targetCoverageDays: 18,
    safetyCoverageDays: 8,
    deadstockThresholdDays: 60,
  },
};

export const RECOMMENDATION_RULES = {
  velocityWindowDays: 180,
  defaultForecastHorizonDays: 30,
  minimumTransferUnits: 2,
  minimumVelocityPerDay: 0.03,
  maximumCoverageDays: 75,
  fallbackPeerGapUnits: 3,
  fallbackMinimumAgeDays: 45,
} as const;

export function getCategoryPolicy(category?: string | null): CategoryPolicy {
  const normalized = category?.trim().toLowerCase() || "";
  return {
    ...DEFAULT_POLICY,
    ...(CATEGORY_POLICY_MAP[normalized] || {}),
  };
}
