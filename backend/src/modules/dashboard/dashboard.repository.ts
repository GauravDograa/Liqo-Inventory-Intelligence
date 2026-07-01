import { prisma } from "../../prisma/client";

export const getLatestTransactionDate = async (organizationId: string) => {
  const result = await prisma.transaction.findFirst({
    where: { organizationId },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  if (result?.date) {
    return result.date;
  }

  const retailResult = await prisma.retailTransaction.findFirst({
    where: { organizationId, status: { not: "CANCELLED" } },
    select: { transactionDate: true },
    orderBy: { transactionDate: "desc" },
  });

  return retailResult?.transactionDate ?? null;
};

export const getOverviewAggregates = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  const legacy = await prisma.transaction.aggregate({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      netRevenue: true,
      cogs: true,
    },
    _count: {
      id: true,
    },
  });

  if (legacy._count.id > 0) {
    return legacy;
  }

  const retailTransactions = await prisma.retailTransaction.findMany({
    where: {
      organizationId,
      transactionDate: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    },
    select: {
      grandTotal: true,
      items: {
        select: {
          quantity: true,
          product: { select: { baseCost: true } },
        },
      },
    },
  });

  const netRevenue = retailTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.grandTotal || 0),
    0
  );
  const cogs = retailTransactions.reduce(
    (sum, transaction) =>
      sum +
      transaction.items.reduce(
        (itemSum, item) => itemSum + item.quantity * Number(item.product.baseCost || 0),
        0
      ),
    0
  );

  return {
    _sum: { netRevenue, cogs },
    _count: { id: retailTransactions.length },
  };
};

export const getRevenueTrend = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      netRevenue: true,
    },
    orderBy: { date: "asc" },
  });

  const revenueByDate = new Map<string, number>();

  for (const transaction of transactions) {
    const key = toBusinessDateKey(transaction.date);
    revenueByDate.set(
      key,
      (revenueByDate.get(key) ?? 0) + Number(transaction.netRevenue || 0)
    );
  }

  if (revenueByDate.size === 0) {
    const retailTransactions = await prisma.retailTransaction.findMany({
      where: {
        organizationId,
        transactionDate: { gte: startDate, lte: endDate },
        status: { not: "CANCELLED" },
      },
      select: {
        transactionDate: true,
        grandTotal: true,
      },
      orderBy: { transactionDate: "asc" },
    });

    for (const transaction of retailTransactions) {
      const key = toBusinessDateKey(transaction.transactionDate);
      revenueByDate.set(
        key,
        (revenueByDate.get(key) ?? 0) + Number(transaction.grandTotal || 0)
      );
    }
  }

  return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));
};

export const getDeadstockValue = async (
  organizationId: string,
  threshold = 90
) => {
  const items = await prisma.inventory.findMany({
    where: {
      organizationId,
      unitsSaleable: { gt: 0 },
      stockAgeDays: { gt: threshold },
    },
    select: {
      unitsSaleable: true,
      sku: {
        select: {
          mrp: true,
        },
      },
    },
  });

  const legacyValue = items.reduce(
    (sum, item) => sum + item.unitsSaleable * (item.sku.mrp || 0),
    0
  );

  if (legacyValue > 0) {
    return legacyValue;
  }

  const retailItems = await prisma.retailInventory.findMany({
    where: {
      organizationId,
      quantityAvailable: { gt: 0 },
    },
    select: {
      quantityAvailable: true,
      product: { select: { mrp: true } },
    },
    take: 10,
    orderBy: { quantityAvailable: "desc" },
  });

  return retailItems.reduce(
    (sum, item) => sum + item.quantityAvailable * Number(item.product.mrp || 0),
    0
  );
};

function toBusinessDateKey(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(value);
}