import { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export const upsertInventory = (
  organizationId: string,
  data: Omit<Prisma.RetailInventoryUncheckedCreateInput, "organizationId">
) => {
  return prisma.retailInventory.upsert({
    where: {
      productId_storeId: {
        productId: data.productId,
        storeId: data.storeId,
      },
    },
    create: {
      ...data,
      organizationId,
    },
    update: {
      quantityOnHand: data.quantityOnHand,
      quantityReserved: data.quantityReserved,
      quantityAvailable: data.quantityAvailable,
      reorderLevel: data.reorderLevel,
      reorderQuantity: data.reorderQuantity,
      safetyStockLevel: data.safetyStockLevel,
      lastStocktakeAt: data.lastStocktakeAt,
    },
    include: {
      product: true,
      store: true,
    },
  });
};

export const findInventory = (organizationId: string, storeId?: string) => {
  return prisma.retailInventory.findMany({
    where: {
      organizationId,
      storeId,
    },
    include: {
      product: true,
      store: true,
    },
    orderBy: [{ store: { name: "asc" } }, { product: { name: "asc" } }],
  });
};

export const findInventoryById = (organizationId: string, id: string) => {
  return prisma.retailInventory.findFirst({
    where: { id, organizationId },
    include: {
      product: true,
      store: true,
    },
  });
};
