"use client";

import { useMemo, useState } from "react";
import { ArrowRight, PackageCheck, Send, Truck } from "lucide-react";
import { ErrorPanel, LoadingPanel, MetricStrip, OperationalFrame } from "@/components/erp/OperationalFrame";
import { StatusBadge } from "@/components/erp/StatusBadge";
import {
  useCreateTransfer,
  useReplenishmentSuggestions,
  useRetailStores,
  useTransfers,
  useTransitionTransfer,
  useWarehouses,
} from "@/hooks/useErp";

const nextAction = (status: string): "approve" | "allocate" | "dispatch" | "in-transit" | "deliver" | null => {
  if (status === "PENDING") return "approve";
  if (status === "APPROVED") return "allocate";
  if (status === "ALLOCATED") return "dispatch";
  if (status === "DISPATCHED") return "in-transit";
  if (status === "IN_TRANSIT") return "deliver";
  return null;
};

const pipeline = ["PENDING", "APPROVED", "ALLOCATED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"];

export default function WarehouseTransfersPage() {
  const transfers = useTransfers();
  const stores = useRetailStores();
  const warehouses = useWarehouses();
  const [destinationStoreId, setDestinationStoreId] = useState("");
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const suggestions = useReplenishmentSuggestions(destinationStoreId || undefined);
  const createTransfer = useCreateTransfer();
  const transition = useTransitionTransfer();

  const selectedSuggestions = useMemo(
    () => (suggestions.data ?? []).filter((item) => item.sourceWarehouseId === sourceWarehouseId),
    [sourceWarehouseId, suggestions.data]
  );

  const openTransfers = (transfers.data ?? []).filter((item) => !["DELIVERED", "CANCELLED"].includes(item.status));

  const createFromSuggestions = async () => {
    if (!sourceWarehouseId || !destinationStoreId || selectedSuggestions.length === 0) return;

    await createTransfer.mutateAsync({
      sourceWarehouseId,
      destinationStoreId,
      items: selectedSuggestions.slice(0, 12).map((item) => ({
        productId: item.productId,
        quantity: item.suggestedQuantity,
        suggestionSource: item.suggestionSource,
      })),
    });
  };

  return (
    <OperationalFrame eyebrow="Warehouse operations" title="Transfer Control Board">
      <MetricStrip
        metrics={[
          { label: "Open transfers", value: `${openTransfers.length}` },
          { label: "Suggestions", value: `${suggestions.data?.length ?? 0}` },
          { label: "Warehouses", value: `${warehouses.data?.length ?? 0}` },
          { label: "In transit", value: `${(transfers.data ?? []).filter((item) => item.status === "IN_TRANSIT").length}`, tone: "warn" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Generate replenishment transfer</h2>
          <select value={destinationStoreId} onChange={(event) => setDestinationStoreId(event.target.value)} className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">Destination store</option>
            {(stores.data ?? []).filter((store) => store.locationType !== "WAREHOUSE").map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <select value={sourceWarehouseId} onChange={(event) => setSourceWarehouseId(event.target.value)} className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">Source warehouse</option>
            {(warehouses.data ?? []).map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
            ))}
          </select>

          <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
            {selectedSuggestions.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Select a store and warehouse to review replenishment suggestions.</p>
            ) : (
              selectedSuggestions.map((item) => (
                <div key={`${item.productId}-${item.destinationStoreId}`} className="border-b border-slate-100 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-slate-500">{item.productSku} · Qty {item.suggestedQuantity} · {(item.confidenceScore * 100).toFixed(0)}%</p>
                </div>
              ))
            )}
          </div>

          <button type="button" onClick={() => void createFromSuggestions()} disabled={!sourceWarehouseId || !destinationStoreId || selectedSuggestions.length === 0 || createTransfer.isPending} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300">
            <PackageCheck size={16} /> Create Transfer
          </button>
        </div>

        <div>
          {transfers.isLoading ? (
            <LoadingPanel />
          ) : transfers.isError ? (
            <ErrorPanel message="Transfer board failed to load" />
          ) : (
            <div className="grid gap-3 2xl:grid-cols-3">
              {pipeline.map((status) => (
                <div key={status} className="min-h-48 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                    <StatusBadge status={status} />
                    <span className="text-xs text-slate-500">
                      {(transfers.data ?? []).filter((item) => item.status === status).length}
                    </span>
                  </div>
                  <div className="space-y-2 p-2">
                    {(transfers.data ?? [])
                      .filter((item) => item.status === status)
                      .map((transfer) => {
                        const action = nextAction(transfer.status);
                        return (
                          <div key={transfer.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-slate-900">{transfer.transferNo}</p>
                              <span className="text-xs text-slate-500">{transfer.items.length} lines</span>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                              {transfer.sourceWarehouse?.name}
                              <ArrowRight className="mx-1 inline text-orange-500" size={13} />
                              {transfer.destinationStore?.name}
                            </p>
                            {action && (
                              <button type="button" onClick={() => transition.mutate({ id: transfer.id, action })} className="mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                {action === "dispatch" ? <Truck size={14} /> : <Send size={14} />}
                                Move to {action.replace("-", " ")}
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </OperationalFrame>
  );
}
