import { prisma } from "../../prisma/client";

export const getLatestTransactionDate = async (organizationId: string) => {
  const result = await prisma.transaction.findFirst({
    where: { organizationId },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  return result?.date ?? null;
};

export const getOverviewAggregates = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  return prisma.transaction.aggregate({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      netRevenue: true,
      cogs: true,
    },
    _count: {
      id: true,
    },
  });
};

export const getRevenueTrend = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      netRevenue: true,
    },
    orderBy: { date: "asc" },
  });

  const revenueByDate = new Map<string, number>();

  for (const transaction of transactions) {
    const key = toBusinessDateKey(transaction.date);
    revenueByDate.set(
      key,
      (revenueByDate.get(key) ?? 0) + Number(transaction.netRevenue || 0)
    );
  }

  return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));
};

export const getDeadstockValue = async (
  organizationId: string,
  threshold = 90
) => {
  const items = await prisma.inventory.findMany({
    where: {
      organizationId,
      unitsSaleable: { gt: 0 },
      stockAgeDays: { gt: threshold },
    },
    select: {
      unitsSaleable: true,
      sku: {
        select: {
          mrp: true,
        },
      },
    },
  });

  return items.reduce(
    (sum, item) => sum + item.unitsSaleable * (item.sku.mrp || 0),
    0
  );
};

function toBusinessDateKey(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(value);
}
