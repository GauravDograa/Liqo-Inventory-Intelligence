import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export const createCustomer = (
  organizationId: string,
  data: Omit<Prisma.CustomerUncheckedCreateInput, "organizationId">
) => prisma.customer.create({ data: { ...data, organizationId } });

export const findCustomers = (organizationId: string) => {
  return prisma.customer.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
};

export const findCustomerById = (organizationId: string, id: string) => {
  return prisma.customer.findFirst({
    where: { id, organizationId },
  });
};
