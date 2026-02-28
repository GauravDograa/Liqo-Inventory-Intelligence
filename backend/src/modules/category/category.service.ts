import * as repo from "./category.repository";
import { prisma } from "../../prisma/client";

interface CategoryAggregate {
  category: string;
  totalRevenue: number;
  totalCOGS: number;
  transactionCount: number;
  grossProfit: number;
  grossMargin: number;
}

export const getCategoryPerformance = async (
  start?: string,
  end?: string
): Promise<CategoryAggregate[]> => {
  const startDate = start ? new Date(start) : new Date("2000-01-01");
  const endDate = end ? new Date(end) : new Date();

  const grouped = await repo.getCategoryPerformance(
    startDate,
    endDate
  );

  const skuIds = grouped.map((g) => g.skuId);

  const skus = await prisma.sKU.findMany({
    where: { id: { in: skuIds } },
    select: { id: true, category: true },
  });

  const skuCategoryMap: Record<string, string> = {};
  skus.forEach((s) => {
    skuCategoryMap[s.id] = s.category;
  });

  const categoryMap: Record<string, CategoryAggregate> = {};

  for (const row of grouped) {
    const category = skuCategoryMap[row.skuId] || "Unknown";

    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        totalRevenue: 0,
        totalCOGS: 0,
        transactionCount: 0,
        grossProfit: 0,
        grossMargin: 0,
      };
    }

    categoryMap[category].totalRevenue += Number(
      row._sum.netRevenue || 0
    );
    categoryMap[category].totalCOGS += Number(
      row._sum.cogs || 0
    );
    categoryMap[category].transactionCount += row._count.id;
  }

  return Object.values(categoryMap).map((c) => {
    const grossProfit = c.totalRevenue - c.totalCOGS;
    const grossMargin =
      c.totalRevenue > 0
        ? (grossProfit / c.totalRevenue) * 100
        : 0;

    return {
      ...c,
      grossProfit,
      grossMargin,
    };
  });
};