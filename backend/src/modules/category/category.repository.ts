import { prisma } from "../../prisma/client";

export const getCategoryPerformance = async (
  startDate: Date,
  endDate: Date
) => {
  return prisma.transaction.groupBy({
    by: ["skuId"],
    where: {
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