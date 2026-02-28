import * as repo from "./deadstock.repository";

export const getDeadStockSummary = async (
  organizationId: string,
  threshold = 90
) => {
  const records = await repo.getDeadStock(
    organizationId,
    threshold
  );

  return records.map(item => {
    const deadStockValue =
      item.unitsSaleable * (item.sku.mrp || 0);

    return {
      store: item.store.name,
      sku: item.sku.externalId,
      category: item.sku.category,
      unitsSaleable: item.unitsSaleable,
      stockAgeDays: item.stockAgeDays,
      deadStockValue
    };
  });
};