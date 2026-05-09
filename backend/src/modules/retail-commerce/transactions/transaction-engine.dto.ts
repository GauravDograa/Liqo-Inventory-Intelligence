import { PaymentMethod } from "@prisma/client";
import { BadRequestError } from "../../../shared/errors/http-errors";

export type CreateTransactionItemDto = {
  productId: string;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
};

export type CreateTransactionPaymentDto = {
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
  paidAt?: string;
};

export type CreateTransactionDto = {
  storeId: string;
  customerId?: string;
  transactionDate?: string;
  placeOfSupply?: string;
  items: CreateTransactionItemDto[];
  payments: CreateTransactionPaymentDto[];
};

const paymentMethods = new Set(Object.values(PaymentMethod));

const assertObject = (value: unknown, message: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value as Record<string, unknown>;
};

const assertString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

const assertOptionalString = (value: unknown, field: string): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return assertString(value, field);
};

const assertPositiveNumber = (value: unknown, field: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new BadRequestError(`${field} must be a positive number`);
  }

  return value;
};

const assertPositiveInteger = (value: unknown, field: string): number => {
  const numberValue = assertPositiveNumber(value, field);

  if (!Number.isInteger(numberValue)) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }

  return numberValue;
};

const assertNonNegativeNumber = (value: unknown, field: string): number => {
  if (value === undefined || value === null) {
    return 0;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new BadRequestError(`${field} must be a non-negative number`);
  }

  return value;
};

const assertDateString = (value: unknown, field: string): string | undefined => {
  const dateValue = assertOptionalString(value, field);
  if (!dateValue) {
    return undefined;
  }

  if (Number.isNaN(new Date(dateValue).getTime())) {
    throw new BadRequestError(`${field} must be a valid ISO date`);
  }

  return dateValue;
};

export const validateCreateTransactionDto = (body: unknown): CreateTransactionDto => {
  const data = assertObject(body, "Request body must be an object");
  const rawItems = data.items;
  const rawPayments = data.payments;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new BadRequestError("At least one transaction item is required");
  }

  if (!Array.isArray(rawPayments) || rawPayments.length === 0) {
    throw new BadRequestError("At least one payment is required");
  }

  const items = rawItems.map((item, index) => {
    const itemData = assertObject(item, `items[${index}] must be an object`);

    return {
      productId: assertString(itemData.productId, `items[${index}].productId`),
      quantity: assertPositiveInteger(itemData.quantity, `items[${index}].quantity`),
      unitPrice:
        itemData.unitPrice === undefined
          ? undefined
          : assertPositiveNumber(itemData.unitPrice, `items[${index}].unitPrice`),
      discountAmount: assertNonNegativeNumber(
        itemData.discountAmount,
        `items[${index}].discountAmount`
      ),
    };
  });

  const payments = rawPayments.map((payment, index) => {
    const paymentData = assertObject(payment, `payments[${index}] must be an object`);
    const method = assertString(paymentData.method, `payments[${index}].method`);

    if (!paymentMethods.has(method as PaymentMethod)) {
      throw new BadRequestError(`payments[${index}].method is not supported`);
    }

    return {
      method: method as PaymentMethod,
      amount: assertPositiveNumber(paymentData.amount, `payments[${index}].amount`),
      referenceNo: assertOptionalString(
        paymentData.referenceNo,
        `payments[${index}].referenceNo`
      ),
      paidAt: assertDateString(paymentData.paidAt, `payments[${index}].paidAt`),
    };
  });

  return {
    storeId: assertString(data.storeId, "storeId"),
    customerId: assertOptionalString(data.customerId, "customerId"),
    transactionDate: assertDateString(data.transactionDate, "transactionDate"),
    placeOfSupply: assertOptionalString(data.placeOfSupply, "placeOfSupply"),
    items,
    payments,
  };
};
