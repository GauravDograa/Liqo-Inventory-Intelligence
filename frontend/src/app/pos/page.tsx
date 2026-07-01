"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Barcode,
  CreditCard,
  IndianRupee,
  Minus,
  Plus,
  ReceiptText,
  ScanLine,
  Search,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateTransaction, useProducts, useRetailInventory, useRetailStores } from "@/hooks/useErp";
import { cartTotals, usePosStore } from "@/stores/posStore";
import { Product } from "@/types/erp.types";

const fallbackProducts: Product[] = [
  { id: "demo-ac-15", sku: "AC-INV-15", name: "Inverter AC 1.5 Ton", gstRate: 18, mrp: 42990, category: { name: "Cooling" } },
  { id: "demo-wm-7", sku: "WM-FL-7KG", name: "Front Load Washer 7kg", gstRate: 18, mrp: 32990, category: { name: "Laundry" } },
  { id: "demo-fr-260", sku: "RF-260-2D", name: "Double Door Refrigerator 260L", gstRate: 18, mrp: 38990, category: { name: "Refrigeration" } },
  { id: "demo-tv-43", sku: "TV-UHD-43", name: "UHD Smart TV 43 inch", gstRate: 18, mrp: 28990, category: { name: "Entertainment" } },
  { id: "demo-mw-28", sku: "MW-CONV-28", name: "Convection Microwave 28L", gstRate: 18, mrp: 14990, category: { name: "Kitchen" } },
  { id: "demo-purifier", sku: "WP-RO-UV", name: "RO + UV Water Purifier", gstRate: 18, mrp: 17990, category: { name: "Kitchen" } },
];

const fallbackStores = [{ id: "demo-store", name: "Demo Flagship Store", code: "DEMO" }];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const numberValue = (value?: string | number | null) => Number(value ?? 0);

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [barcodeMode, setBarcodeMode] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const searchRef = useRef<HTMLInputElement>(null);
  const checkout = useCreateTransaction();
  const productsQuery = useProducts(search);
  const storesQuery = useRetailStores();
  const {
    cart,
    activeStoreId,
    setActiveStoreId,
    addProduct,
    updateQuantity,
    updateDiscount,
    removeProduct,
    clearCart,
  } = usePosStore();
  const inventory = useRetailInventory(activeStoreId || undefined);
  const totals = cartTotals(cart);

  const products = productsQuery.data?.length ? productsQuery.data : fallbackProducts;
  const stores = storesQuery.data?.length ? storesQuery.data : fallbackStores;
  const availability = useMemo(
    () => new Map((inventory.data ?? []).map((item) => [item.productId, item.quantityAvailable])),
    [inventory.data]
  );
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category?.name ?? "General")))];
  const visibleProducts = products.filter((product) => {
    const haystack = `${product.name} ${product.sku} ${product.barcode ?? ""}`.toLowerCase();
    const categoryMatch = activeCategory === "All" || (product.category?.name ?? "General") === activeCategory;
    return categoryMatch && haystack.includes(search.toLowerCase());
  });

  const submitSale = useCallback(async () => {
    if (!activeStoreId || cart.length === 0 || activeStoreId === "demo-store") {
      clearCart();
      return;
    }

    await checkout.mutateAsync({
      storeId: activeStoreId,
      items: cart.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount,
      })),
      payments: [
        {
          method: "UPI",
          amount: Number(totals.grandTotal.toFixed(2)),
        },
      ],
    });
    clearCart();
  }, [activeStoreId, cart, checkout, clearCart, totals.grandTotal]);

  useEffect(() => {
    if (!activeStoreId && stores[0]) setActiveStoreId(stores[0].id);
  }, [activeStoreId, setActiveStoreId, stores]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "F4") {
        event.preventDefault();
        setBarcodeMode((value) => !value);
      }
      if (event.key === "F9") {
        event.preventDefault();
        void submitSale();
      }
      if (event.key === "Escape") clearCart();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [clearCart, submitSale]);

  return (
    <div className="grid min-h-[calc(100vh-9rem)] gap-4 xl:grid-cols-[minmax(520px,1fr)_460px]">
      <section className="flex min-w-0 flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
                Point of sale
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Billing Console
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" className="gap-2 px-3 py-2">
                <ShieldCheck size={15} /> Cashier ready
              </Badge>
              <select
                value={activeStoreId}
                onChange={(event) => setActiveStoreId(event.target.value)}
                className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              {barcodeMode ? (
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
              )}
              <Input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={barcodeMode ? "F2 scan barcode or type SKU" : "F2 search product, category, SKU"}
                className="h-12 pl-10 pr-28 text-base"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                F2 / F4
              </kbd>
            </div>
            <Button variant={barcodeMode ? "default" : "outline"} onClick={() => setBarcodeMode((value) => !value)} className="h-12">
              <Barcode size={17} /> {barcodeMode ? "Barcode lane" : "Search lane"}
            </Button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm ${
                activeCategory === category
                  ? "border-orange-200 bg-orange-50 text-orange-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid flex-1 auto-rows-fr gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {visibleProducts.slice(0, 18).map((product) => {
            const available = availability.get(product.id) ?? (product.id.startsWith("demo") ? 8 : 0);
            const inCart = cart.find((line) => line.product.id === product.id)?.quantity ?? 0;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product, available)}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="line-clamp-2 font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <Badge variant={available <= 2 ? "warning" : "secondary"}>{available} left</Badge>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">MRP</p>
                    <p className="text-xl font-semibold text-slate-900">{formatMoney(numberValue(product.mrp))}</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 group-hover:text-orange-700">
                    {inCart ? `${inCart} in cart` : "Tap to add"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Live cart</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{totals.itemCount} items</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart}>
            Clear Esc
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center px-8 text-center">
              <ReceiptText className="mb-4 text-slate-600" size={42} />
              <p className="font-medium text-slate-900">Ready for billing</p>
              <p className="mt-2 text-sm text-slate-500">
                Scan a barcode, press F2, or select a product tile to begin.
              </p>
            </div>
          ) : (
            cart.map((line) => (
              <div key={line.product.id} className="border-b border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{line.product.name}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{line.product.sku}</p>
                  </div>
                  <button type="button" onClick={() => removeProduct(line.product.id)} className="text-slate-500 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-[112px_1fr] gap-3">
                  <div className="flex items-center rounded-md border border-slate-200">
                    <button type="button" className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50" onClick={() => updateQuantity(line.product.id, line.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold text-slate-900">{line.quantity}</span>
                    <button type="button" className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50" onClick={() => updateQuantity(line.product.id, line.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={line.discountAmount}
                    onChange={(event) => updateDiscount(line.product.id, Number(event.target.value))}
                    aria-label={`Discount for ${line.product.name}`}
                    className="h-9"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{formatMoney(line.unitPrice)} x {line.quantity}</span>
                  <span className="font-semibold text-slate-900">{formatMoney(line.unitPrice * line.quantity - line.discountAmount)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <Card className="m-3 border-orange-200 bg-orange-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <IndianRupee size={17} className="text-orange-500" />
              Tender summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatMoney(totals.subtotal)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Discount</span><span>{formatMoney(totals.discount)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Taxable</span><span>{formatMoney(totals.taxable)}</span></div>
            <div className="flex justify-between text-slate-400"><span>GST</span><span>{formatMoney(totals.gst)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-2xl font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatMoney(totals.grandTotal)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button variant="outline" size="sm"><Banknote size={14} /> Cash</Button>
              <Button variant="outline" size="sm"><CreditCard size={14} /> Card</Button>
              <Button variant="outline" size="sm"><WalletCards size={14} /> UPI</Button>
            </div>
            <Button disabled={cart.length === 0 || checkout.isPending} onClick={() => void submitSale()} className="h-12 w-full text-base">
              Complete sale F9
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
