import { prisma } from "../../prisma/client";

export const getStorePerformance = async (organizationId: string) => {
  return prisma.transaction.groupBy({
    by: ["storeId"],
    where: {
      organizationId
    },
    _sum: {
      netRevenue: true,
      cogs: true
    },
    _count: {
      id: true
    }
  });
};