import * as repo from "./storePerformance.repository";
import { prisma } from "../../prisma/client";

export const getPerformance = async (organizationId: string) => {
  const grouped = await repo.getStorePerformance(organizationId);

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
    const grossProfit = revenue - cogs;

    const grossMargin =
      revenue > 0
        ? (grossProfit / revenue) * 100
        : 0;

    return {
      storeId: store.storeId,
      storeName: storeMap[store.storeId] || "Unknown",
      totalRevenue: revenue,
      totalCOGS: cogs,
      totalGrossProfit: grossProfit,
      grossMargin: Number(grossMargin.toFixed(2)),
      transactionCount: store._count.id
    };
  });
};