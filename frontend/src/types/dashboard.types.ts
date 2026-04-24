import { CategoryPerformanceItem } from "./category.types";
import { DeadstockItem } from "./deadstock.types";
import { RecommendationItem } from "./recommendation.types";
import { StorePerformanceItem } from "./store.types";

export interface DashboardOverview {
  totalRevenue: number;
  totalCOGS?: number;
  grossProfit: number;
  grossMargin?: number;
  totalTransactions: number;
  deadstockValue?: number;
  revenueTrend?: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface AggregatedDashboardApi {
  overview: DashboardOverview;
  categories: CategoryPerformanceItem[];
  stores: StorePerformanceItem[];
  deadstock: DeadstockItem[];
  recommendations: RecommendationItem[];
}

export interface AggregatedDashboardResponse {
  success: boolean;
  data: AggregatedDashboardApi;
}
