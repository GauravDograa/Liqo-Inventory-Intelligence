"use client";

import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/format";
import InventoryKPICard from "../cards/InventoryKPICard";

export default function InventoryKPIs() {
  const { data, isLoading } = useInventory();

  if (isLoading || !data) return null;

  // Total Stock Value
  const totalStockValue = data.reduce(
    (acc, item) =>
      acc +
      item.unitsSaleable *
        item.sku.acquisitionCost,
    0
  );

  // Total Units Available
  const totalUnits = data.reduce(
    (acc, item) => acc + item.unitsSaleable,
    0
  );

  // Low Stock Threshold (define business rule)
  const LOW_STOCK_THRESHOLD = 10;

  const lowStock = data.filter(
    (item) =>
      item.unitsSaleable <= LOW_STOCK_THRESHOLD
  ).length;

  const aging90 = data.filter(
    (item) => item.stockAgeDays > 90
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <InventoryKPICard
        label="Total Stock Value"
        value={formatCurrency(totalStockValue)}
      />
      <InventoryKPICard
        label="Total Units Available"
        value={totalUnits.toLocaleString()}
      />
      <InventoryKPICard
        label="Low Stock SKUs"
        value={lowStock.toString()}
      />
      <InventoryKPICard
        label="90+ Days Aging"
        value={aging90.toString()}
      />
    </div>
  );
}