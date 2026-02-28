import { prisma } from "../../prisma/client";

export const getGroupedVelocity = async (
  organizationId: string,
  startDate: Date,
  storeId?: string
) => {
  return prisma.transaction.groupBy({
    by: ["storeId", "skuId"],
    where: {
      organizationId,
      date: { gte: startDate },
      ...(storeId ? { storeId } : {})
    },
    _sum: {
      quantity: true
    }
  });
};