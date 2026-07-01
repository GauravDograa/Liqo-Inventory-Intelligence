"use client";

import { Activity, AlertTriangle, Boxes, History, TrendingDown } from "lucide-react";
import { ErrorPanel, LoadingPanel, MetricStrip, OperationalFrame } from "@/components/erp/OperationalFrame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLowStockAlerts, useReplenishmentSuggestions, useRetailInventory } from "@/hooks/useErp";

export default function InventoryPage() {
  const inventory = useRetailInventory();
  const alerts = useLowStockAlerts();
  const suggestions = useReplenishmentSuggestions();
  const rows = inventory.data ?? [];
  const lowStockRows = rows.filter((item) => item.quantityAvailable < item.reorderLevel);
  const outOfStockRows = rows.filter((item) => item.quantityAvailable <= 0);
  const healthyRows = rows.filter((item) => item.quantityAvailable >= item.reorderLevel);

  return (
    <OperationalFrame eyebrow="Inventory intelligence" title="Inventory Health Command Center">
      <MetricStrip
        metrics={[
          { label: "SKUs tracked", value: `${rows.length}` },
          { label: "Available units", value: `${rows.reduce((sum, item) => sum + item.quantityAvailable, 0)}` },
          { label: "Low stock", value: `${lowStockRows.length}`, tone: "warn" },
          { label: "Healthy", value: `${healthyRows.length}`, tone: "good" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory health indicators</CardTitle>
              <p className="text-xs text-slate-500">Live stock cover, reorder pressure, and SKU risk.</p>
            </div>
            <Badge variant={outOfStockRows.length ? "destructive" : "success"}>
              {outOfStockRows.length} out of stock
            </Badge>
          </CardHeader>
          <CardContent>
            {inventory.isLoading ? (
              <LoadingPanel />
            ) : inventory.isError ? (
              <ErrorPanel message="Inventory failed to load" />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Store</th>
                      <th className="px-3 py-2">Available</th>
                      <th className="px-3 py-2">Reorder</th>
                      <th className="px-3 py-2">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 80).map((item) => {
                      const pressure = item.reorderLevel > 0 ? item.quantityAvailable / item.reorderLevel : 2;
                      return (
                        <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="px-3 py-3">
                            <p className="font-medium text-slate-900">{item.product.name}</p>
                            <p className="text-xs text-slate-500">{item.product.sku}</p>
                          </td>
                          <td className="px-3 py-3 text-slate-600">{item.store.name}</td>
                          <td className="px-3 py-3 font-semibold text-slate-900">{item.quantityAvailable}</td>
                          <td className="px-3 py-3 text-slate-600">{item.reorderLevel}</td>
                          <td className="px-3 py-3">
                            <div className="h-2 w-32 rounded-full bg-slate-100">
                              <div
                                className={`h-2 rounded-full ${pressure < 1 ? "bg-amber-400" : "bg-emerald-400"}`}
                                style={{ width: `${Math.max(8, Math.min(100, pressure * 100))}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle size={17} className="text-amber-600" /> Operational alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(alerts.data ?? []).slice(0, 8).map((alert) => (
                <div key={alert.id} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                  <p className="font-medium text-amber-900">{alert.product.name}</p>
                  <p className="text-amber-700">{alert.store.name} needs {alert.reorderQuantity} units</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity size={17} className="text-orange-500" /> Health visualization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-slate-50 p-3 text-slate-900"><Boxes className="mx-auto mb-2 text-emerald-600" size={18} />{healthyRows.length}<p className="text-xs text-slate-500">healthy</p></div>
              <div className="rounded-xl bg-slate-50 p-3 text-slate-900"><TrendingDown className="mx-auto mb-2 text-amber-600" size={18} />{lowStockRows.length}<p className="text-xs text-slate-500">low</p></div>
              <div className="rounded-xl bg-slate-50 p-3 text-slate-900"><History className="mx-auto mb-2 text-slate-500" size={18} />{suggestions.data?.length ?? 0}<p className="text-xs text-slate-500">moves</p></div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </OperationalFrame>
  );
}
