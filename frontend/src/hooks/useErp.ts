"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { erpService } from "@/services/erp.service";

export const erpKeys = {
  products: (search: string) => ["erp", "products", search] as const,
  inventory: (storeId?: string) => ["erp", "inventory", storeId] as const,
  stores: ["erp", "stores"] as const,
  warehouses: ["erp", "warehouses"] as const,
  lowStock: (storeId?: string) => ["erp", "low-stock", storeId] as const,
  suggestions: (storeId?: string) => ["erp", "replenishment", storeId] as const,
  transfers: ["erp", "transfers"] as const,
  invoices: ["erp", "invoices"] as const,
  analytics: ["erp", "analytics"] as const,
};

export const useProducts = (search: string) =>
  useQuery({
    queryKey: erpKeys.products(search),
    queryFn: () => erpService.products(search),
    staleTime: 20_000,
  });

export const useRetailInventory = (storeId?: string) =>
  useQuery({
    queryKey: erpKeys.inventory(storeId),
    queryFn: () => erpService.inventory(storeId),
    refetchInterval: 30_000,
  });

export const useRetailStores = () =>
  useQuery({ queryKey: erpKeys.stores, queryFn: erpService.stores });

export const useWarehouses = () =>
  useQuery({ queryKey: erpKeys.warehouses, queryFn: erpService.warehouses });

export const useLowStockAlerts = (storeId?: string) =>
  useQuery({
    queryKey: erpKeys.lowStock(storeId),
    queryFn: () => erpService.lowStockAlerts(storeId),
    refetchInterval: 45_000,
  });

export const useReplenishmentSuggestions = (storeId?: string) =>
  useQuery({
    queryKey: erpKeys.suggestions(storeId),
    queryFn: () => erpService.replenishmentSuggestions(storeId),
    refetchInterval: 45_000,
  });

export const useTransfers = () =>
  useQuery({
    queryKey: erpKeys.transfers,
    queryFn: erpService.transfers,
    refetchInterval: 30_000,
  });

export const useInvoices = () =>
  useQuery({
    queryKey: erpKeys.invoices,
    queryFn: erpService.invoices,
    refetchInterval: 60_000,
  });

export const useErpAnalyticsSummary = () =>
  useQuery({
    queryKey: erpKeys.analytics,
    queryFn: erpService.analyticsSummary,
    refetchInterval: 60_000,
  });

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: erpService.createTransaction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["erp"] });
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: erpService.createTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["erp"] });
    },
  });
};

export const useTransitionTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "allocate" | "dispatch" | "in-transit" | "deliver" }) =>
      erpService.transitionTransfer(id, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["erp", "transfers"] });
      void queryClient.invalidateQueries({ queryKey: ["erp", "inventory"] });
    },
  });
};
