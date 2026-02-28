"use client";

import { DeadstockItem } from "@/types/deadstock.types";

interface Props {
  item: DeadstockItem | null;
  onClose: () => void;
}

export default function DeadstockDrawer({ item, onClose }: Props) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      <div className="w-[420px] bg-white shadow-xl p-6 space-y-6 animate-slideIn">
        <h2 className="text-lg font-semibold">
          SKU {item.sku}
        </h2>

        <div className="space-y-2 text-sm">
          <p><strong>Store:</strong> {item.store}</p>
          <p><strong>Category:</strong> {item.category}</p>
          <p><strong>Aging:</strong> {item.stockAgeDays} days</p>
          <p><strong>Value:</strong> ₹{item.deadStockValue.toLocaleString()}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}