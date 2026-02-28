import * as dashboardService from "../dashboard/dashboard.service";
import * as storeService from "../storePerformance/storePerformance.service";
import * as categoryService from "../category/category.service";
import * as deadstockService from "../deadstock/deadstock.service";

export const generateOverviewInsights = async (
  organizationId: string,
  start?: string,
  end?: string
) => {
  const dashboard = await dashboardService.getDashboardOverview(start, end);
  const stores = await storeService.getPerformance(organizationId);
  const categories = await categoryService.getCategoryPerformance(start, end);
  const deadstock = await deadstockService.getDeadStockSummary(
    organizationId,
    90
  );

  const safeStores = Array.isArray(stores) ? [...stores] : [];
  const safeCategories = Array.isArray(categories) ? [...categories] : [];
  const safeDeadstock = Array.isArray(deadstock) ? deadstock : [];

  const sortedStoresDesc = [...safeStores].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  const sortedStoresAsc = [...safeStores].sort(
    (a, b) => a.totalRevenue - b.totalRevenue
  );

  const topStore = sortedStoresDesc[0] || null;
  const worstStore = sortedStoresAsc[0] || null;

  const sortedCategories = [...safeCategories].sort(
    (a, b) => b.grossMargin - a.grossMargin
  );

  const highestMarginCategory = sortedCategories[0] || null;

  const deadStockValue = safeDeadstock.reduce(
    (sum, d) => sum + (d.deadStockValue || 0),
    0
  );

  const totalRevenue = dashboard?.totalRevenue || 0;

  const deadStockRisk =
    deadStockValue > totalRevenue * 0.2
      ? "High"
      : deadStockValue > totalRevenue * 0.1
      ? "Medium"
      : "Low";

  return {
    totalRevenue,
    grossMargin: dashboard?.grossMargin || 0,
    topPerformer: topStore?.storeName || null,
    worstPerformer: worstStore?.storeName || null,
    highestMarginCategory: highestMarginCategory?.category || null,
    deadStockValue,
    deadStockRisk
  };
};