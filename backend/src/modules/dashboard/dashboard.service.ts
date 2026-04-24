import * as repo from "./dashboard.repository";

export const getDashboardOverview = async (
  organizationId: string,
  start?: string,
  end?: string,
  months?: number,
  range?: "30d" | "3m" | "6m",
  includeRevenueTrend = false
) => {
  const latestTransactionDate = await repo.getLatestTransactionDate(organizationId);
  const endDate = end
    ? endOfDay(new Date(end))
    : latestTransactionDate
    ? endOfDay(new Date(latestTransactionDate))
    : new Date();
  const startDate = start
    ? startOfDay(new Date(start))
    : range
    ? getRangeStartDate(endDate, range)
    : months
    ? getMonthsAgoDate(endDate, months)
    : new Date("2000-01-01");

  const [aggregates, trend, deadstockValue] = await Promise.all([
    repo.getOverviewAggregates(
      organizationId,
      startDate,
      endDate
    ),
    includeRevenueTrend
      ? repo.getRevenueTrend(organizationId, startDate, endDate)
      : Promise.resolve([]),
    repo.getDeadstockValue(organizationId),
  ]);

  const totalRevenue = Number(aggregates._sum.netRevenue || 0);
  const totalCOGS = Number(aggregates._sum.cogs || 0);
  const totalTransactions = aggregates._count.id;

  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const revenueTrend = includeRevenueTrend
    ? trend.map((t) => ({
        date: t.date,
        revenue: Number(t.revenue || 0),
      }))
    : undefined;

  return {
    totalRevenue,
    totalCOGS,
    grossProfit,
    grossMargin: Number(grossMargin.toFixed(2)),
    totalTransactions,
    deadstockValue,
    revenueTrend,
  };
};

function getMonthsAgoDate(referenceDate: Date, months: number) {
  const date = new Date(referenceDate);
  date.setMonth(date.getMonth() - months);
  return date;
}

function getRangeStartDate(
  referenceDate: Date,
  range: "30d" | "3m" | "6m"
) {
  const date = new Date(referenceDate);

  if (range === "30d") {
    date.setDate(date.getDate() - 29);
  } else if (range === "3m") {
    date.setMonth(date.getMonth() - 3);
    date.setDate(date.getDate() + 1);
  } else {
    date.setMonth(date.getMonth() - 6);
    date.setDate(date.getDate() + 1);
  }

  return startOfDay(date);
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}
