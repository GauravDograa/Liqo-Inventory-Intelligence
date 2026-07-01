import { api } from "@/lib/axios";
import {
  Invoice,
  ErpAnalyticsSummary,
  LowStockAlert,
  Product,
  ReplenishmentSuggestion,
  RetailInventory,
  StockTransfer,
  Store,
} from "@/types/erp.types";

const unwrap = <T>(payload: { success: boolean; data: T }) => {
  if (!payload.success) {
    throw new Error("Request failed");
  }

  return payload.data;
};

export const erpService = {
  async products(search?: string): Promise<Product[]> {
    const { data } = await api.get("/retail/products", { params: { search } });
    return unwrap<Product[]>(data);
  },

  async inventory(storeId?: string): Promise<RetailInventory[]> {
    const { data } = await api.get("/retail/inventory", { params: { storeId } });
    return unwrap<RetailInventory[]>(data);
  },

  async stores(): Promise<Store[]> {
    const { data } = await api.get("/retail/stores");
    return unwrap<Store[]>(data);
  },

  async warehouses(): Promise<Store[]> {
    const { data } = await api.get("/retail/warehouse");
    return unwrap<Store[]>(data);
  },

  async lowStockAlerts(storeId?: string): Promise<LowStockAlert[]> {
    const { data } = await api.get("/retail/warehouse/replenishment/suggestions", {
      params: { storeId },
    });
    const suggestions = unwrap<ReplenishmentSuggestion[]>(data);

    return suggestions.map((item, index) => ({
      id: `${item.productId}-${item.destinationStoreId}-${index}`,
      productId: item.productId,
      storeId: item.destinationStoreId,
      quantityAvailable: 0,
      reorderLevel: item.suggestedQuantity,
      reorderQuantity: item.suggestedQuantity,
      triggeredAt: new Date().toISOString(),
      product: { id: item.productId, sku: item.productSku, name: item.productName },
      store: { id: item.destinationStoreId, code: "", name: item.destinationStoreName },
    }));
  },

  async replenishmentSuggestions(storeId?: string): Promise<ReplenishmentSuggestion[]> {
    const { data } = await api.get("/retail/warehouse/replenishment/suggestions", {
      params: { storeId },
    });
    return unwrap<ReplenishmentSuggestion[]>(data);
  },

  async transfers(): Promise<StockTransfer[]> {
    const { data } = await api.get("/retail/warehouse/transfers");
    return unwrap<StockTransfer[]>(data);
  },

  async createTransfer(input: {
    sourceWarehouseId: string;
    destinationStoreId: string;
    items: Array<{ productId: string; quantity: number; suggestionSource?: string }>;
  }) {
    const { data } = await api.post("/retail/warehouse/transfers", input);
    return unwrap<StockTransfer>(data);
  },

  async transitionTransfer(id: string, action: "approve" | "allocate" | "dispatch" | "in-transit" | "deliver") {
    const { data } = await api.post(`/retail/warehouse/transfers/${id}/${action}`);
    return unwrap<StockTransfer>(data);
  },

  async invoices(): Promise<Invoice[]> {
    const { data } = await api.get("/retail/invoices");
    return unwrap<Invoice[]>(data);
  },

  async createTransaction(input: {
    storeId: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number; discountAmount?: number }>;
    payments: Array<{ method: string; amount: number; referenceNo?: string }>;
  }) {
    const { data } = await api.post("/retail/transactions", input);
    return unwrap(data);
  },

  async analyticsSummary(): Promise<ErpAnalyticsSummary> {
    const { data } = await api.get("/retail/analytics/summary");
    return unwrap<ErpAnalyticsSummary>(data);
  },
};
