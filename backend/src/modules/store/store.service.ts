import * as repo from "./store.repository";
import { prisma } from "../../prisma/client";

export const getStorePerformance = async (
  organizationId: string
) => {

  const grouped = await repo.getStorePerformance(
    organizationId
  );

  const storeIds = grouped.map(g => g.storeId);

  const stores = await prisma.store.findMany({
    where: {
      id: { in: storeIds }
    },
    select: {
      id: true,
      name: true
    }
  });

  const storeMap = Object.fromEntries(
    stores.map(s => [s.id, s.name])
  );

  return grouped.map(store => {
    const revenue = Number(store._sum.netRevenue || 0);
    const cogs = Number(store._sum.cogs || 0);
    const totalGrossProfit = revenue - cogs;

    const grossMargin =
      revenue > 0
        ? (totalGrossProfit / revenue) * 100
        : 0;

    return {
      storeId: store.storeId,
      storeName: storeMap[store.storeId] || "Unknown",
      totalRevenue: revenue,
      totalCOGS: cogs,
      transactionCount: store._count.id,
      totalGrossProfit,
      grossMargin: Number(grossMargin.toFixed(2))
    };
  });
};