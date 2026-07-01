import { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";
import {
  DailySalesKpi,
  GstKpi,
  InventoryHealthKpi,
  PaymentMethodKpi,
  ProductSalesVelocityKpi,
  StorePerformanceKpi,
} from "./analytics.types";

export const runInTransaction = <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(callback, { maxWait: 20_000, timeout: 120_000 });

export const findTransactionById = (organizationId: string, transactionId: string) =>
  prisma.retailTransaction.findFirst({
    where: { id: transactionId, organizationId },
    select: { transactionDate: true, storeId: true },
  });

export const findTransactionsForWindow = (
  organizationId: string,
  start: Date,
  end: Date
) =>
  prisma.retailTransaction.findMany({
    where: {
      organizationId,
      transactionDate: { gte: start, lt: end },
      status: { not: "CANCELLED" },
    },
    include: {
      items: true,
      payments: true,
    },
  });

export const findInvoicesForWindow = (organizationId: string, start: Date, end: Date) =>
  prisma.invoice.findMany({
    where: {
      organizationId,
      invoiceDate: { gte: start, lt: end },
      status: { notIn: ["VOID", "CANCELLED"] },
    },
  });

export const findInventorySnapshot = (organizationId: string) =>
  prisma.retailInventory.findMany({
    where: { organizationId },
    select: {
      storeId: true,
      quantityOnHand: true,
      quantityAvailable: true,
      reorderLevel: true,
      reorderQuantity: true,
    },
  });

export const findOpenLowStockAlertsByStore = async (organizationId: string) => {
  const alerts = await prisma.lowStockAlert.groupBy({
    by: ["storeId"],
    where: {
      organizationId,
      status: "OPEN",
    },
    _count: {
      _all: true,
    },
  });

  return new Map(alerts.map((alert) => [alert.storeId, alert._count._all]));
};

export const upsertDailySalesSummary = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  kpi: DailySalesKpi
) =>
  tx.dailySalesSummary.upsert({
    where: {
      organizationId_summaryDate: {
        organizationId,
        summaryDate: kpi.summaryDate,
      },
    },
    create: { ...kpi, organizationId, syncedAt: new Date() },
    update: { ...kpi, syncedAt: new Date() },
  });

export const upsertStorePerformanceSummary = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  kpi: StorePerformanceKpi
) => {
  const { discountTotal: _discountTotal, ...summaryData } = kpi;

  return tx.storePerformanceSummary.upsert({
    where: {
      organizationId_storeId_summaryDate: {
        organizationId,
        storeId: kpi.storeId,
        summaryDate: kpi.summaryDate,
      },
    },
    create: { ...summaryData, organizationId, syncedAt: new Date() },
    update: { ...summaryData, syncedAt: new Date() },
  });
};

export const upsertInventoryHealthSummary = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  kpi: InventoryHealthKpi
) =>
  tx.inventoryHealthSummary.upsert({
    where: {
      organizationId_storeId_summaryDate: {
        organizationId,
        storeId: kpi.storeId,
        summaryDate: kpi.summaryDate,
      },
    },
    create: { ...kpi, organizationId, syncedAt: new Date() },
    update: { ...kpi, syncedAt: new Date() },
  });

export const upsertPaymentMethodSummary = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  kpi: PaymentMethodKpi
) =>
  tx.paymentMethodSummary.upsert({
    where: {
      organizationId_paymentMethod_summaryDate: {
        organizationId,
        paymentMethod: kpi.paymentMethod as PaymentMethod,
        summaryDate: kpi.summaryDate,
      },
    },
    create: { ...kpi, organizationId, syncedAt: new Date() },
    update: { ...kpi, syncedAt: new Date() },
  });

export const upsertGstSummary = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  kpi: GstKpi
) =>
  tx.gstSummary.upsert({
    where: {
      organizationId_summaryDate: {
        organizationId,
        summaryDate: kpi.summaryDate,
      },
    },
    create: { ...kpi, organizationId, syncedAt: new Date() },
    update: { ...kpi, syncedAt: new Date() },
  });

export const upsertProductSalesVelocitySummary = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  kpi: ProductSalesVelocityKpi
) =>
  tx.productSalesVelocitySummary.upsert({
    where: {
      organizationId_productId_storeId_summaryDate: {
        organizationId,
        productId: kpi.productId,
        storeId: kpi.storeId,
        summaryDate: kpi.summaryDate,
      },
    },
    create: { ...kpi, organizationId, syncedAt: new Date() },
    update: { ...kpi, syncedAt: new Date() },
  });

export const getDashboardSummary = async (
  organizationId: string,
  start: Date,
  end: Date
) => {
  const timestampEnd = new Date(end);
  timestampEnd.setDate(timestampEnd.getDate() + 1);

  const [
    dailySales,
    storePerformance,
    inventoryHealth,
    paymentMethods,
    gst,
    salesVelocity,
    transferPipeline,
    forecasts,
  ] =
    await Promise.all([
      prisma.dailySalesSummary.findMany({
        where: { organizationId, summaryDate: { gte: start, lte: end } },
        orderBy: { summaryDate: "desc" },
      }),
      prisma.storePerformanceSummary.findMany({
        where: { organizationId, summaryDate: { gte: start, lte: end } },
        include: { store: true },
        orderBy: [{ summaryDate: "desc" }, { grossRevenue: "desc" }],
      }),
      prisma.inventoryHealthSummary.findMany({
        where: { organizationId, summaryDate: { gte: start, lte: end } },
        include: { store: true },
        orderBy: [{ summaryDate: "desc" }, { lowStockCount: "desc" }],
      }),
      prisma.paymentMethodSummary.findMany({
        where: { organizationId, summaryDate: { gte: start, lte: end } },
        orderBy: [{ summaryDate: "desc" }, { paymentAmount: "desc" }],
      }),
      prisma.gstSummary.findMany({
        where: { organizationId, summaryDate: { gte: start, lte: end } },
        orderBy: { summaryDate: "desc" },
      }),
      prisma.productSalesVelocitySummary.findMany({
        where: { organizationId, summaryDate: { gte: start, lte: end } },
        include: { product: true, store: true },
        orderBy: [{ summaryDate: "desc" }, { unitsSold: "desc" }],
        take: 50,
      }),
      prisma.stockTransfer.groupBy({
        by: ["status"],
        where: {
          organizationId,
          createdAt: { gte: start, lt: timestampEnd },
          deletedAt: null,
        },
        _count: { _all: true },
      }),
      prisma.forecast.findMany({
        where: {
          organizationId,
          generatedAt: { gte: start, lt: timestampEnd },
        },
        include: { product: true, store: true },
        orderBy: [{ generatedAt: "desc" }, { confidenceScore: "desc" }],
        take: 50,
      }),
    ]);

  return {
    dailySales,
    storePerformance,
    inventoryHealth,
    paymentMethods,
    gst,
    salesVelocity,
    transferPipeline: transferPipeline.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
    forecasts,
  };
};
