import { getCategoryPolicy, RECOMMENDATION_RULES } from "../recommendation/recommendation.config";
import { ForecastFeatureRow } from "./forecast.contract";
import type { DemandSignal, DemandSignalContext } from "./forecast.service";

export interface ForecastBlueprintInventoryRow {
  organizationId: string;
  storeId: string;
  skuId: string;
  unitsSaleable: number;
  stockAgeDays: number;
  store?: {
    name: string;
  } | null;
  sku: {
    category: string | null;
    mrp: number | null;
    acquisitionCost: number | null;
  };
}

export function buildForecastFeatureRows(
  inventory: ForecastBlueprintInventoryRow[],
  signals: DemandSignal[],
  context: DemandSignalContext,
  asOfDate = new Date()
): ForecastFeatureRow[] {
  const signalMap = new Map(
    signals.map((signal) => [`${signal.storeId}_${signal.skuId}`, signal])
  );
  const peerStats = buildPeerStats(inventory, signalMap);

  return inventory
    .map((item) => {
      const signal = signalMap.get(`${item.storeId}_${item.skuId}`);

      if (!signal) {
        return null;
      }

      const policy = getCategoryPolicy(item.sku.category);
      const peer = peerStats.get(item.skuId);
      const grossMarginPct =
        item.sku.mrp && item.sku.mrp > 0
          ? Number(
              (
                ((item.sku.mrp - (item.sku.acquisitionCost || 0)) / item.sku.mrp) *
                100
              ).toFixed(2)
            )
          : null;
      const peerAverageUnits = peer?.averageUnits || item.unitsSaleable;
      const peerGapUnits = Number(
        (item.unitsSaleable - peerAverageUnits).toFixed(2)
      );
      const velocityRank = getVelocityRank(
        signal,
        peer?.velocityOrder || []
      );
      const timeFeatures = getTimeFeatures(asOfDate);

      const row: ForecastFeatureRow = {
        organization_id: item.organizationId,
        store_id: item.storeId,
        sku_id: item.skuId,
        category: item.sku.category,
        anchor_month: timeFeatures.anchorMonth,
        anchor_quarter: timeFeatures.anchorQuarter,
        anchor_week_of_year: timeFeatures.anchorWeekOfYear,
        horizon_days: context.horizonDays,
        history_window_days: context.historyWindowDays,
        units_sold_window: signal.unitsSold,
        units_sold_last_30d: signal.unitsSold,
        units_sold_last_90d: signal.unitsSold,
        recent_demand_share: 1,
        observed_velocity_per_day: signal.observedVelocityPerDay,
        previous_window_units: signal.unitsSold,
        short_term_trend_ratio: 1,
        planning_velocity_floor: RECOMMENDATION_RULES.minimumVelocityPerDay,
        current_units: item.unitsSaleable,
        stock_age_days: item.stockAgeDays,
        target_coverage_days: policy.targetCoverageDays,
        safety_coverage_days: policy.safetyCoverageDays,
        gross_margin_pct: grossMarginPct,
        mrp: item.sku.mrp || 0,
        acquisition_cost: item.sku.acquisitionCost || 0,
        deadstock_threshold_days: policy.deadstockThresholdDays,
        store_rank_in_velocity: velocityRank,
        peer_average_units: Number(peerAverageUnits.toFixed(2)),
        peer_gap_units: peerGapUnits,
        seasonal_index: getSeasonalIndex(item.sku.category),
        store_demand_confidence: signal.confidence,
      };

      return row;
    })
    .filter((row): row is ForecastFeatureRow => row !== null);
}

function getTimeFeatures(anchorDate: Date) {
  const startOfYear = new Date(anchorDate.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor(
      (anchorDate.getTime() - startOfYear.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    anchorMonth: anchorDate.getMonth() + 1,
    anchorQuarter: Math.floor(anchorDate.getMonth() / 3) + 1,
    anchorWeekOfYear: Math.ceil(dayOfYear / 7),
  };
}

function buildPeerStats(
  inventory: ForecastBlueprintInventoryRow[],
  signalMap: Map<string, DemandSignal>
) {
  const bySku = new Map<
    string,
    {
      totalUnits: number;
      count: number;
      velocityOrder: DemandSignal[];
    }
  >();

  for (const item of inventory) {
    const existing = bySku.get(item.skuId) || {
      totalUnits: 0,
      count: 0,
      velocityOrder: [],
    };
    existing.totalUnits += item.unitsSaleable;
    existing.count += 1;
    const signal = signalMap.get(`${item.storeId}_${item.skuId}`);
    if (signal) {
      existing.velocityOrder.push(signal);
    }
    bySku.set(item.skuId, existing);
  }

  for (const [, value] of bySku) {
    value.velocityOrder.sort(
      (a, b) => b.observedVelocityPerDay - a.observedVelocityPerDay
    );
  }

  return new Map(
    [...bySku.entries()].map(([skuId, value]) => [
      skuId,
      {
        averageUnits: value.count > 0 ? value.totalUnits / value.count : 0,
        velocityOrder: value.velocityOrder,
      },
    ])
  );
}

function getVelocityRank(
  signal: DemandSignal,
  orderedSignals: DemandSignal[]
) {
  const index = orderedSignals.findIndex(
    (item) =>
      item.storeId === signal.storeId &&
      item.skuId === signal.skuId
  );

  return index >= 0 ? index + 1 : orderedSignals.length + 1;
}

function getSeasonalIndex(category: string | null) {
  switch ((category || "").trim().toLowerCase()) {
    case "ac":
      return 1.2;
    case "tv":
      return 1.05;
    case "refrigerator":
      return 1.08;
    case "washing machine":
      return 1.04;
    default:
      return 1;
  }
}
