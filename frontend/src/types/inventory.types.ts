export interface InventoryItem {
  id: string;
  storeId: string;
  skuId: string;
  unitsAcquired: number;
  unitsSaleable: number;
  stockAgeDays: number;

  sku: {
    id: string;
    category: string;
    acquisitionCost: number;
    refurbCost: number;
  };

  store: {
    id: string;
    name: string;
    region: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type InventoryResponse =
  ApiResponse<InventoryItem[]>;