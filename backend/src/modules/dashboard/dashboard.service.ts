import * as repo from "./dashboard.repository";

export const getDashboardOverview = async (
  start?: string,
  end?: string
) => {
  const startDate = start ? new Date(start) : new Date("2000-01-01");
  const endDate = end ? new Date(end) : new Date();

  const aggregates = await repo.getOverviewAggregates(
    startDate,
    endDate
  );

  const totalRevenue = Number(aggregates._sum.netRevenue || 0);
  const totalCOGS = Number(aggregates._sum.cogs || 0);
  const totalTransactions = aggregates._count.id;

  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const trend = await repo.getRevenueTrend(startDate, endDate);

  const revenueTrend = trend.map((t) => ({
    date: t.date,
    revenue: Number(t._sum.netRevenue || 0),
  }));

  return {
    totalRevenue,
    totalCOGS,
    grossProfit,
    grossMargin: Number(grossMargin.toFixed(2)),
    totalTransactions,
    revenueTrend,
  };
};