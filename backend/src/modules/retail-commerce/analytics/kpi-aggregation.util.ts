import { Prisma } from "@prisma/client";
import {
  DailySalesKpi,
  DateWindow,
  GstKpi,
  InventoryHealthKpi,
  PaymentMethodKpi,
  ProductSalesVelocityKpi,
  StorePerformanceKpi,
} from "./analytics.types";

export const money = (value: Prisma.Decimal.Value) =>
  new Prisma.Decimal(value).toDecimalPlaces(2);

export const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const dayWindow = (date: Date): DateWindow => {
  const start = startOfUtcDay(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    summaryDate: start,
    start,
    end,
  };
};

const sumMoney = (values: Prisma.Decimal[]) =>
  values.reduce((total, value) => total.plus(value), money(0));

const average = (total: Prisma.Decimal, count: number) =>
  count === 0 ? money(0) : total.div(count).toDecimalPlaces(2);

type TransactionForKpi = {
  id: string;
  storeId: string;
  grandTotal: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  cgstTotal: Prisma.Decimal;
  sgstTotal: Prisma.Decimal;
  igstTotal: Prisma.Decimal;
  items: Array<{
    productId: string;
    quantity: number;
    lineTotal: Prisma.Decimal;
  }>;
  payments: Array<{
    method: string;
    amount: Prisma.Decimal;
  }>;
};

type InvoiceForKpi = {
  taxableAmount: Prisma.Decimal;
  cgstTotal: Prisma.Decimal;
  sgstTotal: Prisma.Decimal;
  igstTotal: Prisma.Decimal;
};

type InventoryForKpi = {
  storeId: string;
  quantityOnHand: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
};

export const aggregateDailySales = (
  summaryDate: Date,
  transactions: TransactionForKpi[]
): DailySalesKpi => {
  const grossRevenue = sumMoney(transactions.map((transaction) => transaction.grandTotal));
  const taxableRevenue = sumMoney(transactions.map((transaction) => transaction.taxableAmount));
  const discountTotal = sumMoney(transactions.map((transaction) => transaction.discountTotal));
  const gstTotal = sumMoney(
    transactions.map((transaction) =>
      transaction.cgstTotal.plus(transaction.sgstTotal).plus(transaction.igstTotal)
    )
  );
  const itemQuantity = transactions.reduce(
    (total, transaction) =>
      total + transaction.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
    0
  );

  return {
    summaryDate,
    transactionCount: transactions.length,
    itemQuantity,
    grossRevenue,
    taxableRevenue,
    discountTotal,
    gstTotal,
    averageOrderValue: average(grossRevenue, transactions.length),
  };
};

export const aggregateStorePerformance = (
  summaryDate: Date,
  transactions: TransactionForKpi[]
): StorePerformanceKpi[] => {
  const byStore = new Map<string, TransactionForKpi[]>();
  for (const transaction of transactions) {
    byStore.set(transaction.storeId, [...(byStore.get(transaction.storeId) ?? []), transaction]);
  }

  return [...byStore.entries()].map(([storeId, storeTransactions]) => ({
    ...aggregateDailySales(summaryDate, storeTransactions),
    storeId,
  }));
};

export const aggregatePaymentMethods = (
  summaryDate: Date,
  transactions: TransactionForKpi[]
): PaymentMethodKpi[] => {
  const byMethod = new Map<string, { count: number; amount: Prisma.Decimal }>();

  for (const transaction of transactions) {
    for (const payment of transaction.payments) {
      const existing = byMethod.get(payment.method) ?? { count: 0, amount: money(0) };
      byMethod.set(payment.method, {
        count: existing.count + 1,
        amount: existing.amount.plus(payment.amount).toDecimalPlaces(2),
      });
    }
  }

  return [...byMethod.entries()].map(([paymentMethod, value]) => ({
    summaryDate,
    paymentMethod: paymentMethod as PaymentMethodKpi["paymentMethod"],
    paymentCount: value.count,
    paymentAmount: value.amount,
  }));
};

export const aggregateGst = (
  summaryDate: Date,
  invoices: InvoiceForKpi[]
): GstKpi => {
  const cgstTotal = sumMoney(invoices.map((invoice) => invoice.cgstTotal));
  const sgstTotal = sumMoney(invoices.map((invoice) => invoice.sgstTotal));
  const igstTotal = sumMoney(invoices.map((invoice) => invoice.igstTotal));

  return {
    summaryDate,
    invoiceCount: invoices.length,
    taxableAmount: sumMoney(invoices.map((invoice) => invoice.taxableAmount)),
    cgstTotal,
    sgstTotal,
    igstTotal,
    gstTotal: cgstTotal.plus(sgstTotal).plus(igstTotal).toDecimalPlaces(2),
  };
};

export const aggregateProductVelocity = (
  summaryDate: Date,
  transactions: TransactionForKpi[]
): ProductSalesVelocityKpi[] => {
  const byProductStore = new Map<string, ProductSalesVelocityKpi>();

  for (const transaction of transactions) {
    for (const item of transaction.items) {
      const key = `${item.productId}:${transaction.storeId}`;
      const existing =
        byProductStore.get(key) ??
        {
          summaryDate,
          productId: item.productId,
          storeId: transaction.storeId,
          unitsSold: 0,
          revenue: money(0),
          transactionCount: 0,
        };

      byProductStore.set(key, {
        ...existing,
        unitsSold: existing.unitsSold + item.quantity,
        revenue: existing.revenue.plus(item.lineTotal).toDecimalPlaces(2),
        transactionCount: existing.transactionCount + 1,
      });
    }
  }

  return [...byProductStore.values()];
};

export const aggregateInventoryHealth = (
  summaryDate: Date,
  inventoryRows: InventoryForKpi[],
  openAlertsByStore: Map<string, number>
): InventoryHealthKpi[] => {
  const byStore = new Map<string, InventoryForKpi[]>();
  for (const inventory of inventoryRows) {
    byStore.set(inventory.storeId, [...(byStore.get(inventory.storeId) ?? []), inventory]);
  }

  return [...byStore.entries()].map(([storeId, rows]) => ({
    summaryDate,
    storeId,
    totalProducts: rows.length,
    totalQuantityOnHand: rows.reduce((total, row) => total + row.quantityOnHand, 0),
    totalQuantityAvailable: rows.reduce((total, row) => total + row.quantityAvailable, 0),
    lowStockCount: rows.filter((row) => row.quantityAvailable < row.reorderLevel).length,
    outOfStockCount: rows.filter((row) => row.quantityAvailable <= 0).length,
    overstockCount: rows.filter(
      (row) => row.reorderQuantity > 0 && row.quantityAvailable > row.reorderQuantity * 2
    ).length,
    openLowStockAlerts: openAlertsByStore.get(storeId) ?? 0,
  }));
};
