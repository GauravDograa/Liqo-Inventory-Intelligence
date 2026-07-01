import { BadRequestError, NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./analytics.repository";
import {
  aggregateDailySales,
  aggregateGst,
  aggregateInventoryHealth,
  aggregatePaymentMethods,
  aggregateProductVelocity,
  aggregateStorePerformance,
  dayWindow,
} from "./kpi-aggregation.util";

const parseDate = (value?: string) => {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError("Invalid date");
  }

  return date;
};

export const syncOperationalAnalyticsForDate = async (
  organizationId: string,
  dateInput?: string | Date
) => {
  const date = typeof dateInput === "string" ? parseDate(dateInput) : dateInput ?? new Date();
  const window = dayWindow(date);
  const [transactions, invoices, inventoryRows, openAlertsByStore] = await Promise.all([
    repo.findTransactionsForWindow(organizationId, window.start, window.end),
    repo.findInvoicesForWindow(organizationId, window.start, window.end),
    repo.findInventorySnapshot(organizationId),
    repo.findOpenLowStockAlertsByStore(organizationId),
  ]);

  const dailySales = aggregateDailySales(window.summaryDate, transactions);
  const storePerformance = aggregateStorePerformance(window.summaryDate, transactions);
  const paymentMethods = aggregatePaymentMethods(window.summaryDate, transactions);
  const gst = aggregateGst(window.summaryDate, invoices);
  const salesVelocity = aggregateProductVelocity(window.summaryDate, transactions);
  const inventoryHealth = aggregateInventoryHealth(
    window.summaryDate,
    inventoryRows,
    openAlertsByStore
  );

  await repo.runInTransaction(async (tx) => {
    await repo.upsertDailySalesSummary(tx, organizationId, dailySales);
    await repo.upsertGstSummary(tx, organizationId, gst);

    for (const kpi of storePerformance) {
      await repo.upsertStorePerformanceSummary(tx, organizationId, kpi);
    }

    for (const kpi of paymentMethods) {
      await repo.upsertPaymentMethodSummary(tx, organizationId, kpi);
    }

    for (const kpi of salesVelocity) {
      await repo.upsertProductSalesVelocitySummary(tx, organizationId, kpi);
    }

    for (const kpi of inventoryHealth) {
      await repo.upsertInventoryHealthSummary(tx, organizationId, kpi);
    }
  });

  return {
    summaryDate: window.summaryDate,
    dailySales,
    storePerformance,
    paymentMethods,
    gst,
    salesVelocity,
    inventoryHealth,
  };
};

export const syncOperationalAnalyticsForTransaction = async (
  organizationId: string,
  transactionId: string
) => {
  const transaction = await repo.findTransactionById(organizationId, transactionId);

  if (!transaction) {
    throw new NotFoundError("Retail transaction not found for analytics sync");
  }

  return syncOperationalAnalyticsForDate(organizationId, transaction.transactionDate);
};

const hasDashboardSummaryData = (summary: Awaited<ReturnType<typeof repo.getDashboardSummary>>) =>
  summary.dailySales.length > 0 ||
  summary.storePerformance.length > 0 ||
  summary.inventoryHealth.length > 0 ||
  summary.paymentMethods.length > 0 ||
  summary.gst.length > 0 ||
  summary.salesVelocity.length > 0;

const syncAnalyticsWindow = async (organizationId: string, start: Date, end: Date) => {
  const cursor = new Date(start);

  while (cursor <= end) {
    await syncOperationalAnalyticsForDate(organizationId, cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
};

export const getDashboardSummary = async (
  organizationId: string,
  query: { startDate?: string; endDate?: string }
) => {
  const end = dayWindow(parseDate(query.endDate)).summaryDate;
  const start = query.startDate
    ? dayWindow(parseDate(query.startDate)).summaryDate
    : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);

  const summary = await repo.getDashboardSummary(organizationId, start, end);

  if (hasDashboardSummaryData(summary)) {
    return summary;
  }

  await syncAnalyticsWindow(organizationId, start, end);
  return repo.getDashboardSummary(organizationId, start, end);
};
