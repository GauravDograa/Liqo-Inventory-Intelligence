import { prisma } from "../../prisma/client";

export const getSkuAggregates = async (
  organizationId: string
) => {
  return prisma.transaction.groupBy({
    by: ["skuId"],
    where: {
      organizationId
    },
    _sum: {
      netRevenue: true,
      cogs: true,
      quantity: true
    },
    _count: {
      id: true
    }
  });
};

export const getInventoryBySku = async (
  organizationId: string
) => {
  return prisma.inventory.findMany({
    where: {
      organizationId
    },
    include: {
      sku: true
    }
  });
};