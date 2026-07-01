import { Prisma } from "@prisma/client";
import { BadRequestError } from "../../shared/errors/http-errors";
import { money, sumMoney } from "./gst.util";

export type PaymentAmountInput = {
  amount: Prisma.Decimal.Value;
};

export const getPaymentTotal = (payments: PaymentAmountInput[]) =>
  sumMoney(payments.map((payment) => money(payment.amount)));

export const validatePaymentReconciliation = (
  invoiceTotal: Prisma.Decimal,
  payments: PaymentAmountInput[]
) => {
  const paymentTotal = getPaymentTotal(payments);

  if (!paymentTotal.equals(invoiceTotal)) {
    throw new BadRequestError("Invoice total must equal payment total", {
      invoiceTotal: invoiceTotal.toString(),
      paymentTotal: paymentTotal.toString(),
    });
  }

  return {
    invoiceTotal,
    paymentTotal,
    reconciledAt: new Date(),
  };
};
