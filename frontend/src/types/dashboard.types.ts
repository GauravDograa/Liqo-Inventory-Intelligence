export interface AggregatedDashboardApi {
  overview: {
    totalRevenue: number;
    grossProfit: number;
    totalTransactions: number;
    deadstockValue: number;
  };
  categories: any[];
  stores: any[];
  deadstock: any[];
}

export interface AggregatedDashboardResponse {
  success: boolean;
  data: AggregatedDashboardApi;
}
