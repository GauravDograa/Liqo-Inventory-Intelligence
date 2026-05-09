import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export type TransactionClient = Prisma.TransactionClient;

export const runInTransaction = <T>(
  callback: (tx: TransactionClient) => Promise<T>
) => {
  return prisma.$transaction(callback, {
    maxWait: 20_000,
    timeout: 120_000,
  });
};

export const findStoreById = (
  tx: TransactionClient,
  organizationId: string,
  storeId: string
) => {
  return tx.retailStore.findFirst({
    where: {
      id: storeId,
      organizationId,
      status: "ACTIVE",
    },
  });
};

export const findCustomerById = (
  tx: TransactionClient,
  organizationId: string,
  customerId: string
) => {
  return tx.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      status: "ACTIVE",
    },
  });
};

export const findProductsByIds = (
  tx: TransactionClient,
  organizationId: string,
  productIds: string[]
) => {
  return tx.product.findMany({
    where: {
      id: { in: productIds },
      organizationId,
      status: "ACTIVE",
    },
  });
};

export const findStoreInventory = (
  tx: TransactionClient,
  organizationId: string,
  storeId: string,
  productIds: string[]
) => {
  return tx.retailInventory.findMany({
    where: {
      organizationId,
      storeId,
      productId: { in: productIds },
    },
  });
};

export const createTransaction = (
  tx: TransactionClient,
  data: Prisma.RetailTransactionCreateInput
) => {
  return tx.retailTransaction.create({
    data,
    include: {
      store: true,
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      invoice: true,
      payments: true,
    },
  });
};

export const createPayment = (
  tx: TransactionClient,
  data: Prisma.PaymentCreateInput
) => {
  return tx.payment.create({ data });
};

export const findTransactionByIdForOrganization = (
  tx: TransactionClient,
  organizationId: string,
  id: string
) => {
  return tx.retailTransaction.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      store: true,
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      invoice: true,
      payments: true,
    },
  });
};

export const decrementInventoryIfAvailable = async (
  tx: TransactionClient,
  inventoryId: string,
  quantity: number
) => {
  const result = await tx.retailInventory.updateMany({
    where: {
      id: inventoryId,
      quantityAvailable: { gte: quantity },
    },
    data: {
      quantityOnHand: { decrement: quantity },
      quantityAvailable: { decrement: quantity },
    },
  });

  if (result.count === 0) {
    return null;
  }

  return tx.retailInventory.findUnique({
    where: { id: inventoryId },
  });
};

export const findTransactionById = (organizationId: string, id: string) => {
  return prisma.retailTransaction.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      store: true,
      customer: true,
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
      invoice: true,
      payments: true,
    },
  });
};

export const findTransactions = (organizationId: string) => {
  return prisma.retailTransaction.findMany({
    where: { organizationId },
    include: {
      store: true,
      customer: true,
      items: true,
      invoice: true,
      payments: true,
    },
    orderBy: { transactionDate: "desc" },
  });
};
