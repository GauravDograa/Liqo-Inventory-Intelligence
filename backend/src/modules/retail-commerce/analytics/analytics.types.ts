import { PaymentMethod, Prisma } from "@prisma/client";

export type AnalyticsTransactionClient = Prisma.TransactionClient;

export type DateWindow = {
  summaryDate: Date;
  start: Date;
  end: Date;
};

export type DailySalesKpi = {
  summaryDate: Date;
  transactionCount: number;
  itemQuantity: number;
  grossRevenue: Prisma.Decimal;
  taxableRevenue: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  gstTotal: Prisma.Decimal;
  averageOrderValue: Prisma.Decimal;
};

export type StorePerformanceKpi = DailySalesKpi & {
  storeId: string;
};

export type PaymentMethodKpi = {
  summaryDate: Date;
  paymentMethod: PaymentMethod;
  paymentCount: number;
  paymentAmount: Prisma.Decimal;
};

export type GstKpi = {
  summaryDate: Date;
  invoiceCount: number;
  taxableAmount: Prisma.Decimal;
  cgstTotal: Prisma.Decimal;
  sgstTotal: Prisma.Decimal;
  igstTotal: Prisma.Decimal;
  gstTotal: Prisma.Decimal;
};

export type InventoryHealthKpi = {
  summaryDate: Date;
  storeId: string;
  totalProducts: number;
  totalQuantityOnHand: number;
  totalQuantityAvailable: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  openLowStockAlerts: number;
};

export type ProductSalesVelocityKpi = {
  summaryDate: Date;
  productId: string;
  storeId: string;
  unitsSold: number;
  revenue: Prisma.Decimal;
  transactionCount: number;
};
