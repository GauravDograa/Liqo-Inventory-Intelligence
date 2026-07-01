"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Printer, Search } from "lucide-react";
import { ErrorPanel, LoadingPanel, MetricStrip, OperationalFrame } from "@/components/erp/OperationalFrame";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { useInvoices } from "@/hooks/useErp";

const money = (value: string | number | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

export default function InvoicesPage() {
  const invoices = useInvoices();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      (invoices.data ?? []).filter((invoice) =>
        `${invoice.invoiceNo} ${invoice.customer?.name ?? ""} ${invoice.store?.name ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [invoices.data, query]
  );
  const selected = filtered[0];

  return (
    <OperationalFrame eyebrow="Billing records" title="Invoice Viewer">
      <MetricStrip
        metrics={[
          { label: "Invoices", value: `${invoices.data?.length ?? 0}` },
          { label: "Visible", value: `${filtered.length}` },
          { label: "Revenue", value: money(filtered.reduce((sum, item) => sum + Number(item.grandTotal ?? 0), 0)), tone: "good" },
          { label: "Draft/issued", value: `${filtered.filter((item) => item.status !== "PAID").length}`, tone: "warn" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.8fr)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
            <Search size={18} className="text-orange-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, customer, store" className="h-10 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </div>

          {invoices.isLoading ? (
            <LoadingPanel />
          ) : invoices.isError ? (
            <ErrorPanel message="Invoice list failed to load" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Invoice</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-900">{invoice.invoiceNo}</p>
                        <p className="text-xs text-slate-500">{new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</p>
                      </td>
                      <td className="px-3 py-3">{invoice.customer?.name ?? "Walk-in"}</td>
                      <td className="px-3 py-3"><StatusBadge status={invoice.status} /></td>
                      <td className="px-3 py-3 text-right font-semibold">{money(invoice.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {selected ? (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">GST invoice preview</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">{selected.invoiceNo}</h2>
                </div>
                <FileText className="text-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3 border-y border-slate-200 py-4 text-sm">
                <div><p className="text-slate-500">Store</p><p className="font-medium">{selected.store?.name ?? "-"}</p></div>
                <div><p className="text-slate-500">Customer</p><p className="font-medium">{selected.customer?.name ?? "Walk-in"}</p></div>
                <div><p className="text-slate-500">Taxable</p><p className="font-medium">{money(selected.taxableAmount)}</p></div>
                <div><p className="text-slate-500">Grand total</p><p className="font-medium">{money(selected.grandTotal)}</p></div>
              </div>
              <div className="mt-5 space-y-2">
                {(selected.transaction?.items ?? []).map((item, index) => (
                  <div key={`${item.product.id}-${index}`} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span className="font-medium">{money(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 text-sm font-medium"><Printer size={16} /> Print</button>
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"><Download size={16} /> Export</button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No invoice selected.</p>
          )}
        </aside>
      </section>
    </OperationalFrame>
  );
}
