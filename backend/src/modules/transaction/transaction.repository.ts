import { prisma } from "../../prisma/client";

export const getAllTransactions = async (
  organizationId: string
) => {
  return prisma.transaction.findMany({
    where: { organizationId },
    include: {
      store: true,
      sku: true
    },
    orderBy: { date: "desc" }
  });
};

export const getTransactionsByStore = async (
  organizationId: string,
  storeId: string
) => {
  return prisma.transaction.findMany({
    where: {
      organizationId,
      storeId
    },
    include: {
      store: true,
      sku: true
    },
    orderBy: { date: "desc" }
  });
};