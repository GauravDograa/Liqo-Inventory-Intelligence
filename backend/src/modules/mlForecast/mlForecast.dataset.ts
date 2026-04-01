import { prisma } from "../../prisma/client";
import { getCategoryPolicy, RECOMMENDATION_RULES } from "../recommendation/recommendation.config";
import { ForecastFeatureRow } from "../forecast/forecast.contract";

export interface TrainingDatasetRow extends ForecastFeatureRow {
  anchor_date: string;
  target_units_sold_next_horizon: number;
  target_revenue_next_horizon: number;
  target_margin_next_horizon: number;
  samples_in_history_window: number;
}

export interface TrainingDatasetExport {
  rows: TrainingDatasetRow[];
  metadata: {
    organizationId: string;
    historyWindowDays: number;
    horizonDays: number;
    stepDays: number;
    rowCount: number;
  };
}

export async function buildTrainingDataset(
  organizationId: string,
  options?: {
    historyWindowDays?: number;
    horizonDays?: number;
    stepDays?: number;
  }
): Promise<TrainingDatasetExport> {
  const historyWindowDays =
    options?.historyWindowDays || RECOMMENDATION_RULES.velocityWindowDays;
  const horizonDays =
    options?.horizonDays || RECOMMENDATION_RULES.defaultForecastHorizonDays;
  const stepDays = options?.stepDays || 30;

  const [transactions, inventory] = await Promise.all([
    prisma.transaction.findMany({
      where: { organizationId },
      include: {
        store: true,
        sku: true,
      },
      orderBy: { date: "asc" },
    }),
    prisma.inventory.findMany({
      where: { organizationId },
      include: {
        store: true,
        sku: true,
      },
    }),
  ]);

  const inventoryMap = new Map(
    inventory.map((item) => [`${item.storeId}_${item.skuId}`, item])
  );
  const pairMap = new Map<string, typeof transactions>();

  for (const transaction of transactions) {
    const key = `${transaction.storeId}_${transaction.skuId}`;
    const existing = pairMap.get(key) || [];
    existing.push(transaction);
    pairMap.set(key, existing);
  }

  const rows: TrainingDatasetRow[] = [];

  for (const [key, pairTransactions] of pairMap.entries()) {
    if (pairTransactions.length < 2) {
      continue;
    }

    const firstDate = pairTransactions[0].date;
    const lastDate =
      pairTransactions[pairTransactions.length - 1].date;
    const inventoryRow = inventoryMap.get(key);

    if (!inventoryRow) {
      continue;
    }

    const startAnchor = addDays(firstDate, historyWindowDays);
    const finalAnchor = addDays(lastDate, -horizonDays);

    for (
      let anchor = new Date(startAnchor);
      anchor <= finalAnchor;
      anchor = addDays(anchor, stepDays)
    ) {
      const historyStart = addDays(anchor, -historyWindowDays);
      const futureEnd = addDays(anchor, horizonDays);

      const historyTransactions = pairTransactions.filter(
        (transaction) =>
          transaction.date >= historyStart &&
          transaction.date < anchor
      );
      const previousHistoryStart = addDays(historyStart, -historyWindowDays);
      const previousTransactions = pairTransactions.filter(
        (transaction) =>
          transaction.date >= previousHistoryStart &&
          transaction.date < historyStart
      );
      const last30Start = addDays(anchor, -30);
      const last90Start = addDays(anchor, -90);
      const last30Transactions = pairTransactions.filter(
        (transaction) =>
          transaction.date >= last30Start &&
          transaction.date < anchor
      );
      const last90Transactions = pairTransactions.filter(
        (transaction) =>
          transaction.date >= last90Start &&
          transaction.date < anchor
      );
      const futureTransactions = pairTransactions.filter(
        (transaction) =>
          transaction.date >= anchor &&
          transaction.date < futureEnd
      );

      if (!historyTransactions.length || !futureTransactions.length) {
        continue;
      }

      const unitsSoldWindow = historyTransactions.reduce(
        (sum, transaction) => sum + (transaction.quantity || 0),
        0
      );
      if (unitsSoldWindow <= 0) {
        continue;
      }

      const observedVelocityPerDay = Number(
        (unitsSoldWindow / historyWindowDays).toFixed(2)
      );
      const unitsSoldLast30d = last30Transactions.reduce(
        (sum, transaction) => sum + (transaction.quantity || 0),
        0
      );
      const unitsSoldLast90d = last90Transactions.reduce(
        (sum, transaction) => sum + (transaction.quantity || 0),
        0
      );
      const recentDemandShare = Number(
        (
          unitsSoldLast30d /
          Math.max(unitsSoldWindow, 1)
        ).toFixed(3)
      );
      const previousWindowUnits = previousTransactions.reduce(
        (sum, transaction) => sum + (transaction.quantity || 0),
        0
      );
      const shortTermTrendRatio = Number(
        (
          unitsSoldWindow /
          Math.max(previousWindowUnits, 1)
        ).toFixed(3)
      );
      const futureUnits = futureTransactions.reduce(
        (sum, transaction) => sum + (transaction.quantity || 0),
        0
      );
      const futureRevenue = futureTransactions.reduce(
        (sum, transaction) => sum + transaction.netRevenue,
        0
      );
      const futureMargin = futureTransactions.reduce(
        (sum, transaction) =>
          sum + (transaction.netRevenue - transaction.cogs),
        0
      );
      const category = inventoryRow.sku.category;
      const policy = getCategoryPolicy(category);
      const peerRows = inventory.filter(
        (item) => item.skuId === inventoryRow.skuId
      );
      const peerAverageUnits =
        peerRows.length > 0
          ? peerRows.reduce((sum, item) => sum + item.unitsSaleable, 0) /
            peerRows.length
          : inventoryRow.unitsSaleable;
      const peerGapUnits = Number(
        (inventoryRow.unitsSaleable - peerAverageUnits).toFixed(2)
      );
      const grossMarginPct =
        inventoryRow.sku.mrp && inventoryRow.sku.mrp > 0
          ? Number(
              (
                ((inventoryRow.sku.mrp -
                  (inventoryRow.sku.acquisitionCost || 0)) /
                  inventoryRow.sku.mrp) *
                100
              ).toFixed(2)
            )
          : null;

      rows.push({
        anchor_date: anchor.toISOString(),
        organization_id: organizationId,
        store_id: inventoryRow.storeId,
        sku_id: inventoryRow.skuId,
        category,
        anchor_month: anchor.getMonth() + 1,
        anchor_quarter: Math.floor(anchor.getMonth() / 3) + 1,
        anchor_week_of_year: getWeekOfYear(anchor),
        horizon_days: horizonDays,
        history_window_days: historyWindowDays,
        units_sold_window: unitsSoldWindow,
        units_sold_last_30d: unitsSoldLast30d,
        units_sold_last_90d: unitsSoldLast90d,
        recent_demand_share: recentDemandShare,
        observed_velocity_per_day: observedVelocityPerDay,
        previous_window_units: previousWindowUnits,
        short_term_trend_ratio: shortTermTrendRatio,
        planning_velocity_floor:
          RECOMMENDATION_RULES.minimumVelocityPerDay,
        current_units: inventoryRow.unitsSaleable,
        stock_age_days: inventoryRow.stockAgeDays,
        target_coverage_days: policy.targetCoverageDays,
        safety_coverage_days: policy.safetyCoverageDays,
        gross_margin_pct: grossMarginPct,
        mrp: inventoryRow.sku.mrp || 0,
        acquisition_cost: inventoryRow.sku.acquisitionCost || 0,
        deadstock_threshold_days: policy.deadstockThresholdDays,
        store_rank_in_velocity: getVelocityRank(
          inventoryRow.storeId,
          inventoryRow.skuId,
          transactions,
          historyStart,
          anchor
        ),
        peer_average_units: Number(peerAverageUnits.toFixed(2)),
        peer_gap_units: peerGapUnits,
        seasonal_index: getSeasonalIndex(category),
        store_demand_confidence: buildDemandConfidence(
          unitsSoldWindow,
          observedVelocityPerDay,
          historyWindowDays
        ),
        target_units_sold_next_horizon: futureUnits,
        target_revenue_next_horizon: Number(futureRevenue.toFixed(2)),
        target_margin_next_horizon: Number(futureMargin.toFixed(2)),
        samples_in_history_window: historyTransactions.length,
      });
    }
  }

  return {
    rows,
    metadata: {
      organizationId,
      historyWindowDays,
      horizonDays,
      stepDays,
      rowCount: rows.length,
    },
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getVelocityRank(
  storeId: string,
  skuId: string,
  transactions: Array<{
    storeId: string;
    skuId: string;
    date: Date;
    quantity: number | null;
  }>,
  historyStart: Date,
  anchor: Date
) {
  const peerVelocity = new Map<string, number>();

  for (const transaction of transactions) {
    if (
      transaction.skuId !== skuId ||
      transaction.date < historyStart ||
      transaction.date >= anchor
    ) {
      continue;
    }

    const existing = peerVelocity.get(transaction.storeId) || 0;
    peerVelocity.set(
      transaction.storeId,
      existing + (transaction.quantity || 0)
    );
  }

  const ordered = [...peerVelocity.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const index = ordered.findIndex(([candidateStoreId]) => candidateStoreId === storeId);

  return index >= 0 ? index + 1 : ordered.length + 1;
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

function buildDemandConfidence(
  unitsSold: number,
  observedVelocityPerDay: number,
  historyWindowDays: number
) {
  const volumeScore = Math.min(unitsSold / 20, 1);
  const velocityScore = Math.min(observedVelocityPerDay / 1.5, 1);
  const historyScore = Math.min(historyWindowDays / 180, 1);

  return Number(
    (0.45 + volumeScore * 0.25 + velocityScore * 0.2 + historyScore * 0.1).toFixed(
      3
    )
  );
}

function getWeekOfYear(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor(
      (date.getTime() - startOfYear.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.ceil(dayOfYear / 7);
}
