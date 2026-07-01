"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartLine, Product, UserRole } from "@/types/erp.types";

const money = (value?: string | number | null) => Number(value ?? 0);

type PosState = {
  activeStoreId: string;
  role: UserRole;
  cart: CartLine[];
  selectedProductId?: string;
  setActiveStoreId: (storeId: string) => void;
  setRole: (role: UserRole) => void;
  setSelectedProductId: (productId?: string) => void;
  addProduct: (product: Product, availableQuantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discountAmount: number) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
};

export const usePosStore = create<PosState>()(
  persist(
    (set) => ({
      activeStoreId: "",
      role: "ADMIN",
      cart: [],
      setActiveStoreId: (storeId) => set({ activeStoreId: storeId }),
      setRole: (role) => set({ role }),
      setSelectedProductId: (selectedProductId) => set({ selectedProductId }),
      addProduct: (product, availableQuantity) =>
        set((state) => {
          const existing = state.cart.find((line) => line.product.id === product.id);

          if (existing) {
            return {
              cart: state.cart.map((line) =>
                line.product.id === product.id
                  ? { ...line, quantity: line.quantity + 1 }
                  : line
              ),
              selectedProductId: product.id,
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                product,
                quantity: 1,
                unitPrice: money(product.mrp),
                discountAmount: 0,
                availableQuantity,
              },
            ],
            selectedProductId: product.id,
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((line) =>
            line.product.id === productId
              ? { ...line, quantity: Math.max(1, quantity) }
              : line
          ),
        })),
      updateDiscount: (productId, discountAmount) =>
        set((state) => ({
          cart: state.cart.map((line) =>
            line.product.id === productId
              ? { ...line, discountAmount: Math.max(0, discountAmount) }
              : line
          ),
        })),
      removeProduct: (productId) =>
        set((state) => ({
          cart: state.cart.filter((line) => line.product.id !== productId),
        })),
      clearCart: () => set({ cart: [], selectedProductId: undefined }),
    }),
    {
      name: "liqo-retail-session",
      partialize: (state) => ({
        activeStoreId: state.activeStoreId,
        role: state.role,
      }),
    }
  )
);

export const cartTotals = (cart: CartLine[]) => {
  const subtotal = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discount = cart.reduce((sum, line) => sum + line.discountAmount, 0);
  const taxable = Math.max(0, subtotal - discount);
  const gst = cart.reduce((sum, line) => {
    const rate = money(line.product.gstRate);
    const lineTaxable = Math.max(0, line.unitPrice * line.quantity - line.discountAmount);
    return sum + (lineTaxable * rate) / 100;
  }, 0);

  return {
    subtotal,
    discount,
    taxable,
    gst,
    grandTotal: taxable + gst,
    itemCount: cart.reduce((sum, line) => sum + line.quantity, 0),
  };
};
