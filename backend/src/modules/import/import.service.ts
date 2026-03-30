import { randomUUID } from "crypto";
import { prisma } from "../../prisma/client";
import {
  ImportFileInput,
  ImportReplaceResult,
  ImportValidationResult,
} from "./import.types";
import { validateImportFiles } from "./import.validator";

const DEFAULT_ORGANIZATION_ID =
  process.env.DEFAULT_ORGANIZATION_ID || "default-org-001";

export function validateDatasetImport(
  files: ImportFileInput
): ImportValidationResult {
  return validateImportFiles(files);
}

export async function replaceDatasetImport(
  organizationId: string = DEFAULT_ORGANIZATION_ID,
  files: ImportFileInput
): Promise<ImportReplaceResult> {
  const validation = validateImportFiles(files);

  if (!validation.valid || !validation.data) {
    throw Object.assign(new Error("Import validation failed"), {
      statusCode: 400,
      details: validation,
    });
  }

  const { stores, skus, inventory, transactions } = validation.data;
  const storeIdMap = new Map<number, string>();
  const skuIdMap = new Map<number, string>();

  stores.forEach((store) => {
    storeIdMap.set(store.externalId, randomUUID());
  });

  const existingSkus = await prisma.sKU.findMany({
    where: {
      externalId: {
        in: skus.map((sku) => sku.externalId),
      },
    },
    select: {
      id: true,
      externalId: true,
    },
  });

  existingSkus.forEach((sku) => {
    skuIdMap.set(sku.externalId, sku.id);
  });
  const existingSkuIds = new Set(existingSkus.map((sku) => sku.externalId));

  const newSkus = skus.filter((sku) => !skuIdMap.has(sku.externalId));
  newSkus.forEach((sku) => {
    skuIdMap.set(sku.externalId, randomUUID());
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.organization.upsert({
        where: { id: organizationId },
        update: {},
        create: {
          id: organizationId,
          name: "Imported Dataset Organization",
        },
      });

      await tx.inventory.deleteMany({
        where: { organizationId },
      });

      await tx.transaction.deleteMany({
        where: { organizationId },
      });

      await tx.store.deleteMany({
        where: { organizationId },
      });

      for (const sku of skus) {
        if (!existingSkuIds.has(sku.externalId)) {
          continue;
        }

        await tx.sKU.update({
          where: { externalId: sku.externalId },
          data: {
            category: sku.category,
            mrp: sku.mrp,
            condition: sku.condition,
            acquisitionCost: sku.acquisitionCost,
            refurbCost: sku.refurbCost,
          },
        });
      }

      if (newSkus.length) {
        await tx.sKU.createMany({
          data: newSkus.map((sku) => ({
            id: skuIdMap.get(sku.externalId)!,
            externalId: sku.externalId,
            category: sku.category,
            mrp: sku.mrp,
            condition: sku.condition,
            acquisitionCost: sku.acquisitionCost,
            refurbCost: sku.refurbCost,
          })),
        });
      }

      await tx.store.createMany({
        data: stores.map((store) => ({
          id: storeIdMap.get(store.externalId)!,
          externalId: store.externalId,
          code: store.code,
          name: store.name,
          region: store.region,
          city: store.city,
          cityType: store.cityType,
          organizationId,
        })),
      });

      await tx.inventory.createMany({
        data: inventory.map((item) => ({
          storeId: storeIdMap.get(item.storeExternalId)!,
          skuId: skuIdMap.get(item.skuExternalId)!,
          organizationId,
          unitsAcquired: item.unitsAcquired,
          unitsSaleable: item.unitsSaleable,
          stockAgeDays: item.stockAgeDays,
        })),
      });

      await tx.transaction.createMany({
        data: transactions.map((item) => ({
          externalId: item.externalId,
          storeId: storeIdMap.get(item.storeExternalId)!,
          skuId: skuIdMap.get(item.skuExternalId)!,
          organizationId,
          date: item.date,
          quantity: item.quantity,
          sellingPriceGst: item.sellingPriceGst,
          netRevenue: item.netRevenue,
          cogs: item.cogs,
          grossMarginPct: item.grossMarginPct,
          inventoryAgeBucket: item.inventoryAgeBucket,
        })),
      });
    },
    {
      maxWait: 20_000,
      timeout: 120_000,
    }
  );

  return {
    organizationId,
    summary: validation.summary,
    issues: validation.issues,
  };
}

export function resolveImportOrganizationId(
  organizationId?: string
) {
  return organizationId || DEFAULT_ORGANIZATION_ID;
}
