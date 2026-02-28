import { prisma } from "../../prisma/client";

export const getDeadStock = async (
  organizationId: string,
  threshold: number
) => {
  return prisma.inventory.findMany({
    where: {
      organizationId,
      unitsSaleable: { gt: 0 },
      stockAgeDays: { gt: threshold }
    },
    include: {
      store: true,
      sku: true
    }
  });
};