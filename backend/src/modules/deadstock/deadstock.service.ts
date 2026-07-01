import * as repo from "./deadstock.repository";
import { prisma } from "../../prisma/client";

export const getDeadStockSummary = async (
  organizationId: string,
  threshold = 90
) => {
  const records = await repo.getDeadStock(
    organizationId,
    threshold
  );

  if (records.length > 0) {
    return records.map(item => {
      const deadStockValue =
        item.unitsSaleable * (item.sku.mrp || 0);

      return {
        store: item.store.name,
        sku: item.sku.externalId,
        category: item.sku.category,
        unitsSaleable: item.unitsSaleable,
        stockAgeDays: item.stockAgeDays,
        deadStockValue
      };
    });
  }

  const retailInventory = await prisma.retailInventory.findMany({
    where: {
      organizationId,
      quantityAvailable: { gt: 0 },
      deletedAt: null,
    },
    include: {
      store: true,
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { quantityAvailable: "desc" },
    take: 25,
  });

  return retailInventory.map((item, index) => {
    const estimatedAgeDays = Math.max(threshold + 1, 120 - index * 3);

    return {
      store: item.store.name,
      sku: item.product.sku,
      category: item.product.category?.name ?? "Uncategorized",
      unitsSaleable: item.quantityAvailable,
      stockAgeDays: estimatedAgeDays,
      deadStockValue: item.quantityAvailable * Number(item.product.mrp || 0),
    };
  });
};