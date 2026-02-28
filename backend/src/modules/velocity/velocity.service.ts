import * as repo from "./velocity.repository";
import { prisma } from "../../prisma/client";

export const getVelocity = async (
  organizationId: string,
  days = 30,
  storeId?: string
) => {

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const grouped = await repo.getGroupedVelocity(
    organizationId,
    startDate,
    storeId
  );

  if (!grouped.length) return [];

  const skuIds = grouped.map(g => g.skuId);
  const storeIds = grouped.map(g => g.storeId);

  const skus = await prisma.sKU.findMany({
    where: { id: { in: skuIds } },
    select: { id: true, category: true }
  });

  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, name: true }
  });

  const skuMap = Object.fromEntries(
    skus.map(s => [s.id, s])
  );

  const storeMap = Object.fromEntries(
    stores.map(s => [s.id, s])
  );

  return grouped.map(row => {
    const unitsSold = row._sum.quantity || 0;

    return {
      storeId: row.storeId,
      storeName: storeMap[row.storeId]?.name || null,
      skuId: row.skuId,
      category: skuMap[row.skuId]?.category || null,
      unitsSold,
      velocityPerDay: Number(
        (unitsSold / days).toFixed(2)
      )
    };
  });
};