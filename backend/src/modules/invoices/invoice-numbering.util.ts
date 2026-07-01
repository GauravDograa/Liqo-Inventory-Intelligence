import { BadRequestError } from "../../shared/errors/http-errors";
import { InvoiceNumberParts } from "./invoice.types";

const sanitizeStoreCode = (storeCode: string) => {
  const code = storeCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  if (!code) {
    throw new BadRequestError("Store code is required for invoice numbering");
  }

  return code;
};

export const getFinancialYear = (date: Date) => date.getFullYear();

export const formatInvoiceNumber = (
  storeCode: string,
  financialYear: number,
  sequenceNumber: number
): string => {
  return `${sanitizeStoreCode(storeCode)}-${financialYear}-${sequenceNumber
    .toString()
    .padStart(6, "0")}`;
};

export const buildInvoiceNumber = (
  storeCode: string,
  invoiceDate: Date,
  sequenceNumber: number
): InvoiceNumberParts => {
  const financialYear = getFinancialYear(invoiceDate);

  return {
    invoiceNo: formatInvoiceNumber(storeCode, financialYear, sequenceNumber),
    financialYear,
    sequenceNumber,
  };
};
