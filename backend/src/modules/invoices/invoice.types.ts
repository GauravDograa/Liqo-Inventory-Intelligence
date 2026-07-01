import { Prisma } from "@prisma/client";

export type InvoiceTransactionClient = Prisma.TransactionClient;

export type GstLineInput = {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal.Value;
  discountAmount?: Prisma.Decimal.Value;
  gstRate: Prisma.Decimal.Value;
};

export type GstLine = {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  gstRate: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
};

export type GstTotals = {
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  cgstTotal: Prisma.Decimal;
  sgstTotal: Prisma.Decimal;
  igstTotal: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
};

export type InvoiceNumberParts = {
  invoiceNo: string;
  financialYear: number;
  sequenceNumber: number;
};
