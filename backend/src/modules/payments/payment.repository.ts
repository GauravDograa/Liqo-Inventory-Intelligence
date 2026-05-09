import { prisma } from "../../prisma/client";

export const findPayments = (organizationId: string) => {
  return prisma.payment.findMany({
    where: { organizationId },
    include: {
      invoice: true,
      transaction: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findPaymentById = (organizationId: string, id: string) => {
  return prisma.payment.findFirst({
    where: { id, organizationId },
    include: {
      invoice: true,
      transaction: {
        include: {
          store: true,
          customer: true,
        },
      },
    },
  });
};
