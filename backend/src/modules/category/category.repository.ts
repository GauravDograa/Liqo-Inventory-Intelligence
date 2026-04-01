import { prisma } from "../../prisma/client";

export const getCategoryPerformance = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  return prisma.transaction.groupBy({
    by: ["skuId"],
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
