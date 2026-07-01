import { Prisma } from "@prisma/client";
import { BadRequestError } from "../../shared/errors/http-errors";
import { GstLine, GstLineInput, GstTotals } from "./invoice.types";

export const money = (value: Prisma.Decimal.Value) =>
  new Prisma.Decimal(value).toDecimalPlaces(2);

export const percentage = (value: Prisma.Decimal.Value) =>
  new Prisma.Decimal(value).toDecimalPlaces(2);

export const sumMoney = (values: Prisma.Decimal[]) =>
  values.reduce((total, value) => total.plus(value), money(0));

export const isInterStateSale = (storeState?: string | null, placeOfSupply?: string | null) => {
  if (!storeState || !placeOfSupply) {
    return false;
  }

  return storeState.trim().toLowerCase() !== placeOfSupply.trim().toLowerCase();
};

export const calculateGstLine = (
  item: GstLineInput,
  interStateSale: boolean
): GstLine => {
  const unitPrice = money(item.unitPrice);
  const discountAmount = money(item.discountAmount ?? 0);
  const grossAmount = unitPrice.mul(item.quantity).toDecimalPlaces(2);

  if (discountAmount.gt(grossAmount)) {
    throw new BadRequestError(`Discount exceeds line total for product ${item.productId}`);
  }

  const taxableAmount = grossAmount.minus(discountAmount).toDecimalPlaces(2);
  const gstRate = percentage(item.gstRate);
  const gstAmount = taxableAmount.mul(gstRate).div(100).toDecimalPlaces(2);
  const cgstAmount = interStateSale ? money(0) : gstAmount.div(2).toDecimalPlaces(2);
  const sgstAmount = interStateSale ? money(0) : gstAmount.minus(cgstAmount).toDecimalPlaces(2);
  const igstAmount = interStateSale ? gstAmount : money(0);
  const lineTotal = taxableAmount.plus(gstAmount).toDecimalPlaces(2);

  return {
    productId: item.productId,
    quantity: item.quantity,
    unitPrice,
    discountAmount,
    taxableAmount,
    gstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    lineTotal,
  };
};

export const calculateGstTotals = (lines: GstLine[]): GstTotals => ({
  subtotal: sumMoney(lines.map((line) => line.unitPrice.mul(line.quantity).toDecimalPlaces(2))),
  discountTotal: sumMoney(lines.map((line) => line.discountAmount)),
  taxableAmount: sumMoney(lines.map((line) => line.taxableAmount)),
  cgstTotal: sumMoney(lines.map((line) => line.cgstAmount)),
  sgstTotal: sumMoney(lines.map((line) => line.sgstAmount)),
  igstTotal: sumMoney(lines.map((line) => line.igstAmount)),
  grandTotal: sumMoney(lines.map((line) => line.lineTotal)),
});
