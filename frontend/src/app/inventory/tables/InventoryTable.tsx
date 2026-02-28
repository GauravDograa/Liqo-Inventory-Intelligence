"use client";

import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/format";

export default function InventoryTable() {
  const { data, isLoading } = useInventory();

  if (isLoading || !data) return null;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-6">
        Inventory Details
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-sm border-b">
            <th className="pb-3">Store</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Stock Value</th>
            <th>Aging</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => {
            const stock = item.unitsSaleable;
            const value =
              item.unitsSaleable *
              item.sku.acquisitionCost;

            const lowStock = stock < 10; // define threshold

            return (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-4 font-medium">
                  {item.store.name}
                </td>

                <td>{item.skuId.slice(0, 8)}</td>

                <td>{item.sku.category}</td>

                <td>{stock}</td>

                <td>{formatCurrency(value)}</td>

                <td>{item.stockAgeDays} days</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lowStock
                        ? "bg-red-100 text-red-600"
                        : item.stockAgeDays > 90
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {lowStock
                      ? "Low Stock"
                      : item.stockAgeDays > 90
                      ? "Aging Risk"
                      : "Healthy"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}