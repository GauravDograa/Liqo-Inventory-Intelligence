"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, ReceiptText, ShoppingCart, Warehouse } from "lucide-react";
import { ErrorPanel, LoadingPanel, MetricStrip, OperationalFrame } from "@/components/erp/OperationalFrame";
import { useLowStockAlerts, useReplenishmentSuggestions, useRetailInventory, useRetailStores, useTransfers } from "@/hooks/useErp";
import { usePosStore } from "@/stores/posStore";

export default function StoreOperationsPage() {
  const { activeStoreId, setActiveStoreId, role, setRole } = usePosStore();
  const stores = useRetailStores();
  const inventory = useRetailInventory(activeStoreId || undefined);
  const alerts = useLowStockAlerts(activeStoreId || undefined);
  const suggestions = useReplenishmentSuggestions(activeStoreId || undefined);
  const transfers = useTransfers();

  const activeTransfers = (transfers.data ?? []).filter(
    (transfer) => transfer.destinationStore?.id === activeStoreId && !["DELIVERED", "CANCELLED"].includes(transfer.status)
  );
  const stockValue = (inventory.data ?? []).reduce(
    (sum, item) => sum + Number(item.product.mrp ?? 0) * item.quantityAvailable,
    0
  );

  return (
    <OperationalFrame
      eyebrow="Store operations"
      title="Shift Command Dashboard"
      actions={
        <>
          <select value={role} onChange={(event) => setRole(event.target.value as never)} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200">
            {["OWNER", "ADMIN", "STORE_MANAGER", "CASHIER", "WAREHOUSE_MANAGER", "ANALYST"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select value={activeStoreId} onChange={(event) => setActiveStoreId(event.target.value)} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">All stores</option>
            {(stores.data ?? []).filter((store) => store.locationType !== "WAREHOUSE").map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </>
      }
    >
      <MetricStrip
        metrics={[
          { label: "Available units", value: `${(inventory.data ?? []).reduce((sum, item) => sum + item.quantityAvailable, 0)}` },
          { label: "Stock value", value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stockValue), tone: "good" },
          { label: "Low stock", value: `${alerts.data?.length ?? 0}`, tone: "warn" },
          { label: "Inbound transfers", value: `${activeTransfers.length}` },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { href: "/pos", icon: ShoppingCart, label: "POS Billing", detail: "Counter sale, cart, GST preview" },
            { href: "/inventory", icon: Boxes, label: "Inventory Dashboard", detail: "Stock, aging, availability" },
            { href: "/warehouse-transfers", icon: Warehouse, label: "Warehouse Transfers", detail: "Allocate, dispatch, delivery" },
            { href: "/invoices", icon: ReceiptText, label: "Invoice Viewer", detail: "GST invoices and export queue" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40">
                <div className="flex items-center justify-between">
                  <Icon className="text-orange-500" size={22} />
                  <ArrowRight className="text-slate-400 group-hover:text-orange-500" size={18} />
                </div>
                <h2 className="mt-4 font-semibold text-slate-900">{item.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </Link>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
              <AlertTriangle size={18} className="text-amber-600" /> Low stock alerts
            </div>
            {alerts.isLoading ? (
              <LoadingPanel label="Loading alerts" />
            ) : alerts.isError ? (
              <ErrorPanel message="Alerts failed to load" />
            ) : (
              <div className="max-h-72 space-y-2 overflow-auto">
                {(alerts.data ?? []).slice(0, 8).map((alert) => (
                  <div key={alert.id} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                    <p className="font-medium text-amber-900">{alert.product.name}</p>
                    <p className="text-amber-200/80">{alert.store.name} · reorder {alert.reorderQuantity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">Replenishment suggestions</h2>
            <div className="max-h-72 space-y-2 overflow-auto">
              {(suggestions.data ?? []).slice(0, 8).map((item) => (
                <div key={`${item.productId}-${item.destinationStoreId}`} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-slate-500">Qty {item.suggestedQuantity} from {item.sourceWarehouseName ?? "unassigned warehouse"}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </OperationalFrame>
  );
}
