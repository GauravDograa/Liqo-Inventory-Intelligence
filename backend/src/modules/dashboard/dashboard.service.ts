import * as repo from "./dashboard.repository";

export const getDashboardOverview = async (
  organizationId: string,
  start?: string,
  end?: string,
  months?: number
) => {
  const startDate = start
    ? new Date(start)
    : months
    ? getMonthsAgoDate(months)
    : new Date("2000-01-01");
  const endDate = end ? new Date(end) : new Date();

  const aggregates = await repo.getOverviewAggregates(
    organizationId,
    startDate,
    endDate
  );

  const totalRevenue = Number(aggregates._sum.netRevenue || 0);
  const totalCOGS = Number(aggregates._sum.cogs || 0);
  const totalTransactions = aggregates._count.id;

  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const trend = await repo.getRevenueTrend(organizationId, startDate, endDate);

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

function getMonthsAgoDate(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}
