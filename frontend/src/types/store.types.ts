/* ===============================
   STORE PERFORMANCE
================================= */

export interface StorePerformanceItem {
  storeId: string;
  storeName: string;
  transactionCount: number;
  totalRevenue: number;
  totalCOGS: number;
  totalGrossProfit: number;
  grossMargin: number;
}

/* Generic wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type StorePerformanceResponse =
  ApiResponse<StorePerformanceItem[]>;