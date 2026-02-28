/* ===============================
   CATEGORY PERFORMANCE
================================= */

export interface CategoryPerformanceItem {
  category: string;
  totalRevenue: number;
}

/* Generic API Wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type CategoryPerformanceResponse =
  ApiResponse<CategoryPerformanceItem[]>;