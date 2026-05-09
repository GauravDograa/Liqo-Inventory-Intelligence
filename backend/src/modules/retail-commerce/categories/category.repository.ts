import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export const createCategory = (
  organizationId: string,
  data: Omit<Prisma.CategoryUncheckedCreateInput, "organizationId">
) => prisma.category.create({ data: { ...data, organizationId } });

export const findCategories = (organizationId: string) => {
  return prisma.category.findMany({
    where: { organizationId },
    include: { parent: true },
    orderBy: { name: "asc" },
  });
};

export const findCategoryById = (organizationId: string, id: string) => {
  return prisma.category.findFirst({
    where: { id, organizationId },
    include: { parent: true, children: true },
  });
};
