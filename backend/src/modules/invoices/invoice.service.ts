import fs from "fs/promises";
import { BadRequestError, NotFoundError } from "../../shared/errors/http-errors";
import * as repo from "./invoice.repository";
import { generateInvoicePdf, persistInvoicePdf } from "./invoice-pdf.generator";
import { buildInvoiceNumber, getFinancialYear } from "./invoice-numbering.util";
import { calculateGstLine, calculateGstTotals, isInterStateSale, money } from "./gst.util";
import { validatePaymentReconciliation } from "./payment-reconciliation.util";
import { GstLineInput, InvoiceTransactionClient } from "./invoice.types";

export const listInvoices = (organizationId: string) => {
  return repo.findInvoices(organizationId);
};

export const getInvoice = async (organizationId: string, id: string) => {
  const invoice = await repo.findInvoiceById(organizationId, id);

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  return invoice;
};

export const calculateInvoiceLines = (
  items: GstLineInput[],
  storeState?: string | null,
  placeOfSupply?: string | null
) => {
  const interStateSale = isInterStateSale(storeState, placeOfSupply);
  const lines = items.map((item) => calculateGstLine(item, interStateSale));

  return {
    interStateSale,
    lines,
    totals: calculateGstTotals(lines),
  };
};

export const createInvoiceNumber = async (
  tx: InvoiceTransactionClient,
  input: {
    organizationId: string;
    storeId: string;
    storeCode: string;
    invoiceDate: Date;
  }
) => {
  const financialYear = getFinancialYear(input.invoiceDate);
  const latest = await repo.findLatestInvoiceSequence(
    tx,
    input.organizationId,
    input.storeId,
    financialYear
  );
  const sequenceNumber = (latest?.sequenceNumber ?? 0) + 1;

  return buildInvoiceNumber(input.storeCode, input.invoiceDate, sequenceNumber);
};

export const validateInvoicePaymentReconciliation = validatePaymentReconciliation;

export const toMoney = money;

export const buildInvoiceAuditTrail = (input: {
  createdBy: "TRANSACTION_ENGINE" | "INVOICE_ENGINE";
  transactionId: string;
  paymentTotal: string;
  invoiceTotal: string;
  gstMode: "INTRA_STATE" | "INTER_STATE";
}) => ({
  createdBy: input.createdBy,
  transactionId: input.transactionId,
  paymentTotal: input.paymentTotal,
  invoiceTotal: input.invoiceTotal,
  gstMode: input.gstMode,
  generatedAt: new Date().toISOString(),
});

export const generateAndPersistInvoicePdf = async (
  organizationId: string,
  invoiceId: string
) => {
  const invoice = await repo.findInvoiceForPdf(organizationId, invoiceId);

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  const pdf = generateInvoicePdf(invoice);
  const pdfPath = await persistInvoicePdf(organizationId, invoice.invoiceNo, pdf);

  await repo.runInTransaction(async (tx) => {
    await repo.updateInvoicePdf(tx, organizationId, invoice.id, {
      pdfPath,
      pdfGeneratedAt: new Date(),
      auditTrail: {
        ...((invoice.auditTrail && typeof invoice.auditTrail === "object" && !Array.isArray(invoice.auditTrail))
          ? invoice.auditTrail
          : {}),
        pdfGeneratedAt: new Date().toISOString(),
      },
    });
  });

  return {
    pdf,
    pdfPath,
    invoiceNo: invoice.invoiceNo,
  };
};

export const getInvoicePdf = async (organizationId: string, invoiceId: string) => {
  const invoice = await repo.findInvoiceForPdf(organizationId, invoiceId);

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  if (invoice.pdfPath) {
    try {
      const pdf = await fs.readFile(invoice.pdfPath);
      return {
        pdf,
        invoiceNo: invoice.invoiceNo,
      };
    } catch {
      // Regenerate below if the file was moved or cleaned up locally.
    }
  }

  if (!invoice.transaction.items.length) {
    throw new BadRequestError("Invoice PDF cannot be generated without invoice items");
  }

  return generateAndPersistInvoicePdf(organizationId, invoiceId);
};
