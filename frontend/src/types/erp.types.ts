export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "STORE_MANAGER"
  | "CASHIER"
  | "WAREHOUSE_MANAGER"
  | "ANALYST";

export type Product = {
  id: string;
  sku: string;
  name: string;
  barcode?: string | null;
  gstRate?: string | number;
  mrp?: string | number;
  baseCost?: string | number;
  category?: { name: string } | null;
  brand?: { name: string } | null;
};

export type RetailInventory = {
  id: string;
  productId: string;
  storeId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  safetyStockLevel: number;
  product: Product;
  store: { id: string; name: string; code: string; locationType?: string };
};

export type Store = {
  id: string;
  code: string;
  name: string;
  city?: string | null;
  locationType?: "STORE" | "WAREHOUSE";
};

export type CartLine = {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  availableQuantity?: number;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  status: string;
  grandTotal: string | number;
  taxableAmount: string | number;
  gstTotal?: string | number;
  customer?: { name: string; phone?: string | null } | null;
  store?: { name: string; code: string } | null;
  transaction?: { transactionNo: string; items?: Array<{ product: Product; quantity: number; lineTotal: string | number }> };
};

export type LowStockAlert = {
  id: string;
  productId: string;
  storeId: string;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  triggeredAt: string;
  product: Product;
  store: Store;
};

export type StockTransfer = {
  id: string;
  transferNo: string;
  status: "PENDING" | "APPROVED" | "ALLOCATED" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  sourceWarehouse: Store;
  destinationStore: Store;
  dispatchReference?: string | null;
  trackingReference?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    requestedQuantity: number;
    allocatedQuantity: number;
    dispatchedQuantity: number;
    deliveredQuantity: number;
    product: Product;
  }>;
};

export type ReplenishmentSuggestion = {
  productId: string;
  productName: string;
  productSku: string;
  destinationStoreId: string;
  destinationStoreName: string;
  sourceWarehouseId: string | null;
  sourceWarehouseName: string | null;
  suggestedQuantity: number;
  confidenceScore: number;
  suggestionSource: string;
};

export type ErpAnalyticsSummary = {
  dailySales: Array<{
    summaryDate: string;
    transactionCount: number;
    grossRevenue: string | number;
    gstTotal: string | number;
    averageOrderValue: string | number;
  }>;
  storePerformance: Array<{
    storeId: string;
    transactionCount: number;
    grossRevenue: string | number;
    store?: Store | null;
  }>;
  inventoryHealth: Array<{
    totalProducts: number;
    totalQuantityAvailable: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockCount: number;
  }>;
  paymentMethods: Array<{
    paymentMethod: string;
    paymentCount: number;
    paymentAmount: string | number;
  }>;
  gst: Array<{
    invoiceCount: number;
    gstTotal: string | number;
    taxableAmount: string | number;
  }>;
  salesVelocity: Array<{
    unitsSold: number;
    revenue: string | number;
    product?: Product | null;
    store?: Store | null;
  }>;
  transferPipeline: Array<{
    status: string;
    count: number;
  }>;
  forecasts: Array<{
    id: string;
    workflow: string;
    predictedQuantity: string | number;
    confidenceScore: string | number;
    product?: Product | null;
    store?: Store | null;
  }>;
};
