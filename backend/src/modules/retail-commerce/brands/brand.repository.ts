import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export const createBrand = (
  organizationId: string,
  data: Omit<Prisma.BrandUncheckedCreateInput, "organizationId">
) => {
  return prisma.brand.create({
    data: {
      ...data,
      organizationId,
    },
  });
};

export const findBrands = (organizationId: string) => {
  return prisma.brand.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
};

export const findBrandById = (organizationId: string, id: string) => {
  return prisma.brand.findFirst({
    where: { id, organizationId },
  });
};
