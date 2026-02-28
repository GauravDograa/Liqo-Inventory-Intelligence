export interface DeadstockItem {
  store: string;
  sku: number;
  category: string;
  unitsSaleable: number;
  stockAgeDays: number;
  deadStockValue: number;
}

export interface DeadstockResponse {
  success: boolean;
  data: DeadstockItem[];
}