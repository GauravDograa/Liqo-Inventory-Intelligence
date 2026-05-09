import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export const createProduct = (
  organizationId: string,
  data: Omit<Prisma.ProductUncheckedCreateInput, "organizationId">
) => prisma.product.create({ data: { ...data, organizationId } });

export const findProducts = (organizationId: string) => {
  return prisma.product.findMany({
    where: { organizationId },
    include: { brand: true, category: true },
    orderBy: { name: "asc" },
  });
};

export const findProductById = (organizationId: string, id: string) => {
  return prisma.product.findFirst({
    where: { id, organizationId },
    include: { brand: true, category: true },
  });
};
