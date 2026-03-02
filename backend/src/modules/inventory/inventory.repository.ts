import { prisma } from "../../prisma/client";

export const findInventoryByOrganization = (organizationId: string) => {
  return prisma.inventory.findMany({
    where: { organizationId },
    include: {
      sku: true,
      store: true, // optional but good to include
    },
  });
};