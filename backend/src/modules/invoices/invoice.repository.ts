import { prisma } from "../../prisma/client";

export const findInvoices = (organizationId: string) => {
  return prisma.invoice.findMany({
    where: { organizationId },
    include: {
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
