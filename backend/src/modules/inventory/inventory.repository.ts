import { prisma } from "../../prisma/client";

export const findInventoryByOrganization = (organizationId: string) => {
  return prisma.inventory.findMany({
    where: { organizationId }
  });
};