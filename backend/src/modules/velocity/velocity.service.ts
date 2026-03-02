import * as repo from "./velocity.repository";
import { prisma } from "../../prisma/client";

export const getVelocity = async (
  organizationId: string,
  days = 365,   // safer default
  storeId?: string
) => {

  console.log("=== VELOCITY CALCULATION START ===");
  console.log("Days window:", days);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const grouped = await repo.getGroupedVelocity(
    organizationId,
    startDate,
    storeId
  );

  console.log("Grouped velocity rows:", grouped.length);

  if (!grouped.length) {
    console.log("No transactions found in window.");
    return [];
  }

  const skuIds = [...new Set(grouped.map(g => g.skuId))];
  const storeIds = [...new Set(grouped.map(g => g.storeId))];

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

  // Calculate actual day span to avoid distortion
  const now = new Date();
  const actualDays =
    (now.getTime() - startDate.getTime()) /
    (1000 * 60 * 60 * 24);

  const safeDays = actualDays > 0 ? actualDays : 1;

  const result = grouped.map(row => {
    const unitsSold = row._sum.quantity || 0;

    const velocityPerDay = Number(
      (unitsSold / safeDays).toFixed(2)
    );

    return {
      storeId: row.storeId,
      storeName: storeMap[row.storeId]?.name || null,
      skuId: row.skuId,
      category: skuMap[row.skuId]?.category || null,
      unitsSold,
      velocityPerDay
    };
  });

  console.log("Velocity sample:", result.slice(0, 5));
  console.log("=== VELOCITY CALCULATION END ===");

  return result;
};