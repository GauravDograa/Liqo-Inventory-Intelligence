export interface SimulationProjection {
  revenue: number;
  margin: number;
  grossMarginPct: number;
  deadUnits: number;
  lostSalesUnits: number;
  deadStockValue: number;
  revenueAtRisk: number;
}

export interface SimulationUplift {
  revenueIncrease: number;
  marginIncrease: number;
  marginImprovementPct: number;
  lostSalesRecovered: number;
  deadStockReduction: number;
  deadStockValueRecovered: number;
  transferCost: number;
  netBenefit: number;
  transferredUnits: number;
  transferredInventoryCost: number;
}

export interface SimulationPlanningAssumptions {
  horizonDays: number;
  velocityWindowDays: number;
  coverageDrivenTransfers: boolean;
  fixedCostPerTransfer: number;
  variableCostPerUnit: number;
  demandSignalSource: string;
  averageDemandConfidence: number;
  modelReadyCoveragePct: number;
  modelName?: string;
}

export interface SimulationSummary {
  recommendedActions: number;
  projectedRevenueLiftPct: number;
  projectedMarginLiftPct: number;
  projectedNetBenefit: number;
  capitalFreed: number;
  demandSignalSource: string;
  averageDemandConfidence: number;
}

export interface SimulationResult {
  totalRecommendations: number;
  baseline: SimulationProjection;
  postTransfer: SimulationProjection;
  uplift: SimulationUplift;
  planningAssumptions: SimulationPlanningAssumptions;
  summary?: SimulationSummary;
}

export interface SimulationResponse {
  success: boolean;
  data: SimulationResult;
}

export interface SimulationComparisonItem {
  modelName: string;
  label: string;
  result: SimulationResult;
}

export interface SimulationComparisonResult {
  provider: string;
  comparedModels: number;
  items: SimulationComparisonItem[];
}

export interface SimulationComparisonResponse {
  success: boolean;
  data: SimulationComparisonResult;
}
