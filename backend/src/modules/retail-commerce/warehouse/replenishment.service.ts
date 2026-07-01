import { Prisma } from "@prisma/client";
import * as repo from "./warehouse.repository";
import { createTransfer } from "./transfer.service";
import { ReplenishmentSuggestion } from "./warehouse.types";

const decimalToNumber = (value: Prisma.Decimal | null | undefined) =>
  value ? Number(value.toString()) : 0;

const suggestionKey = (productId: string, storeId: string) => `${productId}:${storeId}`;

export const generateReplenishmentSuggestions = async (
  organizationId: string,
  filters: { storeId?: string }
): Promise<ReplenishmentSuggestion[]> => {
  const [alerts, forecasts] = await Promise.all([
    repo.findOpenLowStockAlerts(organizationId, filters.storeId),
    repo.findLatestReorderForecasts(organizationId, filters.storeId),
  ]);

  const suggestions = new Map<string, ReplenishmentSuggestion>();

  for (const alert of alerts) {
    const shortage = Math.max(alert.reorderLevel - alert.quantityAvailable, 1);
    const quantity = Math.max(alert.reorderQuantity, shortage);
    const warehouseInventory = await repo.findBestWarehouseInventory(organizationId, alert.productId);

    suggestions.set(suggestionKey(alert.productId, alert.storeId), {
      productId: alert.productId,
      productName: alert.product.name,
      productSku: alert.product.sku,
      destinationStoreId: alert.storeId,
      destinationStoreName: alert.store.name,
      sourceWarehouseId: warehouseInventory?.storeId ?? null,
      sourceWarehouseName: warehouseInventory?.store.name ?? null,
      suggestedQuantity: warehouseInventory ? Math.min(quantity, warehouseInventory.quantityAvailable) : quantity,
      confidenceScore: warehouseInventory ? 0.74 : 0.42,
      suggestionSource: "LOW_STOCK_ALERT",
      signals: {
        lowStockAlertId: alert.id,
        quantityAvailable: alert.quantityAvailable,
        reorderLevel: alert.reorderLevel,
        reorderQuantity: alert.reorderQuantity,
        warehouseQuantityAvailable: warehouseInventory?.quantityAvailable ?? 0,
      },
    });
  }

  for (const forecast of forecasts) {
    if (!forecast.storeId || !forecast.recommendedReorderQuantity || forecast.recommendedReorderQuantity <= 0) {
      continue;
    }

    const key = suggestionKey(forecast.productId, forecast.storeId);
    const existing = suggestions.get(key);
    const warehouseInventory = existing?.sourceWarehouseId
      ? null
      : await repo.findBestWarehouseInventory(organizationId, forecast.productId);
    const availableWarehouseQuantity =
      existing?.signals && typeof existing.signals === "object" && "warehouseQuantityAvailable" in existing.signals
        ? Number((existing.signals as Record<string, unknown>).warehouseQuantityAvailable ?? 0)
        : warehouseInventory?.quantityAvailable ?? 0;
    const suggestedQuantity = Math.max(existing?.suggestedQuantity ?? 0, forecast.recommendedReorderQuantity);

    suggestions.set(key, {
      productId: forecast.productId,
      productName: forecast.product.name,
      productSku: forecast.product.sku,
      destinationStoreId: forecast.storeId,
      destinationStoreName: forecast.store?.name ?? "Store",
      sourceWarehouseId: existing?.sourceWarehouseId ?? warehouseInventory?.storeId ?? null,
      sourceWarehouseName: existing?.sourceWarehouseName ?? warehouseInventory?.store.name ?? null,
      suggestedQuantity: availableWarehouseQuantity > 0 ? Math.min(suggestedQuantity, availableWarehouseQuantity) : suggestedQuantity,
      confidenceScore: Math.max(existing?.confidenceScore ?? 0, decimalToNumber(forecast.confidenceScore)),
      suggestionSource: existing ? "LOW_STOCK_AND_FORECAST" : "REORDER_FORECAST",
      signals: {
        ...(existing?.signals && typeof existing.signals === "object" ? existing.signals : {}),
        forecastId: forecast.id,
        forecastQuantity: decimalToNumber(forecast.predictedQuantity),
        recommendedReorderQuantity: forecast.recommendedReorderQuantity,
        stockoutRisk: decimalToNumber(forecast.stockoutRisk),
        forecastConfidenceScore: decimalToNumber(forecast.confidenceScore),
        warehouseQuantityAvailable: availableWarehouseQuantity,
      },
    });
  }

  return [...suggestions.values()]
    .filter((suggestion) => suggestion.suggestedQuantity > 0)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
};

export const createTransferFromSuggestions = async (
  organizationId: string,
  body: Record<string, unknown>
) => {
  const destinationStoreId = typeof body.destinationStoreId === "string" ? body.destinationStoreId : undefined;
  const sourceWarehouseId = typeof body.sourceWarehouseId === "string" ? body.sourceWarehouseId : undefined;

  const suggestions = await generateReplenishmentSuggestions(organizationId, {
    storeId: destinationStoreId,
  });
  const eligible = suggestions.filter(
    (suggestion) =>
      suggestion.destinationStoreId === destinationStoreId &&
      suggestion.sourceWarehouseId === sourceWarehouseId
  );

  if (!destinationStoreId || !sourceWarehouseId || eligible.length === 0) {
    return {
      created: false,
      reason: "No replenishment suggestions found for the selected warehouse and store",
      suggestions,
    };
  }

  const transfer = await createTransfer(organizationId, {
    sourceWarehouseId,
    destinationStoreId,
    requestedByUserId: typeof body.requestedByUserId === "string" ? body.requestedByUserId : undefined,
    notes: "Generated from replenishment suggestions",
    metadata: {
      generatedBy: "replenishment_engine",
    },
    items: eligible.map((suggestion) => ({
      productId: suggestion.productId,
      quantity: suggestion.suggestedQuantity,
      suggestionSource: suggestion.suggestionSource,
      signals: suggestion.signals,
    })),
  });

  return {
    created: true,
    transfer,
    suggestionsUsed: eligible.length,
  };
};
