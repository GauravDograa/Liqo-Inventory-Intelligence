import { prisma } from "../../prisma/client";

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
  return prisma.transaction.groupBy({
    by: ["date"],
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      netRevenue: true,
    },
    orderBy: {
      date: "asc",
    },
  });
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
