import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export const createStore = (
  organizationId: string,
  data: Omit<Prisma.RetailStoreUncheckedCreateInput, "organizationId">
) => prisma.retailStore.create({ data: { ...data, organizationId } });

export const findStores = (organizationId: string) => {
  return prisma.retailStore.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
};

export const findStoreById = (organizationId: string, id: string) => {
  return prisma.retailStore.findFirst({
    where: { id, organizationId },
  });
};
