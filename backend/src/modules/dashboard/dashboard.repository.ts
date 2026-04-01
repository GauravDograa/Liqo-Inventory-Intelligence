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
