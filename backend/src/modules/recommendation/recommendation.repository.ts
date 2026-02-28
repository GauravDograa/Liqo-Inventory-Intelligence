import { prisma } from "../../prisma/client";

export const getInventoryWithStoreAndSku = async (
  organizationId: string
) => {
  return prisma.inventory.findMany({
    where: {
      organizationId
    },
    include: {
      store: true,
      sku: true
    }
  });
};