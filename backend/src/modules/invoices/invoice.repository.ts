import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { InvoiceTransactionClient } from "./invoice.types";

const db = (tx?: InvoiceTransactionClient) => tx ?? prisma;

export const runInTransaction = <T>(
  callback: (tx: InvoiceTransactionClient) => Promise<T>
) => prisma.$transaction(callback, {
  maxWait: 20_000,
  timeout: 120_000,
});

export const findLatestInvoiceSequence = (
  tx: InvoiceTransactionClient,
  organizationId: string,
  storeId: string,
  financialYear: number
) => {
  return tx.invoice.findFirst({
    where: {
      organizationId,
      storeId,
      financialYear,
      sequenceNumber: { not: null },
    },
    orderBy: {
      sequenceNumber: "desc",
    },
    select: {
      sequenceNumber: true,
    },
  });
};

export const findInvoices = (organizationId: string) => {
  return prisma.invoice.findMany({
    where: { organizationId },
    include: {
      store: true,
      customer: true,
      transaction: true,
      payments: true,
    },
    orderBy: { invoiceDate: "desc" },
  });
};

export const findInvoiceById = (organizationId: string, id: string) => {
  return prisma.invoice.findFirst({
    where: { id, organizationId },
    include: {
      store: true,
      customer: true,
      transaction: {
        include: {
          store: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      payments: true,
    },
  });
};

export const findInvoiceForPdf = (
  organizationId: string,
  id: string,
  tx?: InvoiceTransactionClient
) => {
  return db(tx).invoice.findFirst({
    where: { id, organizationId },
    include: {
      store: true,
      customer: true,
      transaction: {
        include: {
          store: true,
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      payments: true,
    },
  });
};

export const updateInvoicePdf = (
  tx: InvoiceTransactionClient,
  organizationId: string,
  id: string,
  data: Pick<Prisma.InvoiceUncheckedUpdateInput, "pdfPath" | "pdfGeneratedAt" | "auditTrail">
) => {
  return tx.invoice.updateMany({
    where: {
      id,
      organizationId,
    },
    data,
  });
};

export const createInvoice = (
  tx: InvoiceTransactionClient,
  data: Prisma.InvoiceCreateInput
) => {
  return tx.invoice.create({
    data,
  });
};
