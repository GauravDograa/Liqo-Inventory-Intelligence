import { prisma } from "../../prisma/client";

export const getSkuPerformance = async (
  organizationId: string
) => {

  const grouped = await prisma.transaction.groupBy({
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

  const skuIds = grouped.map(g => g.skuId);

  const skus = await prisma.sKU.findMany({
    where: { id: { in: skuIds } },
    select: {
      id: true,
      category: true,
      externalId: true
    }
  });

  const skuMap = Object.fromEntries(
    skus.map(s => [s.id, s])
  );

  return grouped.map(item => {

    const revenue = Number(item._sum.netRevenue || 0);
    const cogs = Number(item._sum.cogs || 0);
    const grossProfit = revenue - cogs;

    const grossMargin =
      revenue > 0
        ? (grossProfit / revenue) * 100
        : 0;

    return {
      skuId: item.skuId,
      externalId: skuMap[item.skuId]?.externalId,
      category: skuMap[item.skuId]?.category,
      totalRevenue: revenue,
      totalCOGS: cogs,
      totalQuantity: item._sum.quantity || 0,
      transactionCount: item._count.id,
      grossProfit,
      grossMargin: Number(grossMargin.toFixed(2))
    };
  });
};