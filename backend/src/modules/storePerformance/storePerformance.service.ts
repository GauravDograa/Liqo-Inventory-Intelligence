import * as repo from "./storePerformance.repository";
import { prisma } from "../../prisma/client";

export const getPerformance = async (organizationId: string) => {
  const grouped = await repo.getStorePerformance(organizationId);

  if (grouped.length > 0) {
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
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

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
  }

  const retailStores = await prisma.retailStore.findMany({
    where: { organizationId, locationType: "STORE", deletedAt: null },
    select: {
      id: true,
      name: true,
      transactions: {
        where: { status: { not: "CANCELLED" } },
        select: {
          grandTotal: true,
          items: {
            select: {
              quantity: true,
              product: { select: { baseCost: true } },
            },
          },
        },
      },
    },
  });

  return retailStores.map((store) => {
    const revenue = store.transactions.reduce(
      (sum, transaction) => sum + Number(transaction.grandTotal || 0),
      0
    );
    const cogs = store.transactions.reduce(
      (sum, transaction) =>
        sum + transaction.items.reduce(
          (itemSum, item) => itemSum + item.quantity * Number(item.product.baseCost || 0),
          0
        ),
      0
    );
    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      storeId: store.id,
      storeName: store.name,
      totalRevenue: revenue,
      totalCOGS: cogs,
      totalGrossProfit: grossProfit,
      grossMargin: Number(grossMargin.toFixed(2)),
      transactionCount: store.transactions.length,
    };
  });
};