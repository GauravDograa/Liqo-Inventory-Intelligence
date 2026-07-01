import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import deadstockRoutes from "../modules/deadstock/deadstock.routes";
import insightsRoutes from "../modules/insights/insights.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";
import recommendationRoutes from "../modules/recommendation/recommendation.routes";
import simulationRoutes from "../modules/simulation/simulation.routes";
import skuRoutes from "../modules/sku/sku.routes";
import storeRoutes from "../modules/store/store.routes";
import storePerformanceRoutes from "../modules/storePerformance/storePerformance.routes";
import transactionRoutes from "../modules/transaction/transaction.routes";
import velocityRoutes from "../modules/velocity/velocity.routes";
import categoryRoutes from "../modules/category/category.routes";
import importRoutes from "../modules/import/import.routes";
import mlForecastRoutes from "../modules/mlForecast/mlForecast.routes";
import retailCommerceRoutes from "../modules/retail-commerce/retail-commerce.routes";
import retailTransactionRoutes from "../modules/transactions/transaction.routes";
import { authenticate } from "../middleware/auth.middleware";
import auditRoutes from "../modules/audit/audit.routes";
import { auditAction } from "../middleware/audit.middleware";
import { enforceStoreScope, requirePermission } from "../middleware/role.middleware";

const router = Router();
router.use("/auth", authRoutes);

// 🔒 Auth middleware applies to everything below
router.use(authenticate);

// 🔐 Protected routes
router.use("/dashboard", requirePermission("analytics:read"), enforceStoreScope(), dashboardRoutes);
router.use("/deadstock", requirePermission("inventory:read"), deadstockRoutes);
router.use("/insights", requirePermission("analytics:read"), insightsRoutes);
router.use("/inventory", requirePermission("inventory:read"), enforceStoreScope(), auditAction({ action: "LEGACY_INVENTORY_API_WRITE", entityType: "Inventory", severity: "CRITICAL" }), inventoryRoutes);
router.use("/recommendations", requirePermission("inventory:read"), recommendationRoutes);
router.use("/simulation", requirePermission("analytics:read"), simulationRoutes);
router.use("/sku", skuRoutes);
router.use("/stores", storeRoutes);
router.use("/store-performance", requirePermission("analytics:read"), enforceStoreScope(), storePerformanceRoutes);
router.use("/transactions", requirePermission("transactions:read"), enforceStoreScope(), auditAction({ action: "LEGACY_TRANSACTION_API_WRITE", entityType: "Transaction", severity: "CRITICAL" }), transactionRoutes);
router.use("/velocity", velocityRoutes);
router.use("/category", requirePermission("catalog:read"), categoryRoutes);
router.use("/import", importRoutes);
router.use("/ml-forecast", requirePermission("analytics:read"), mlForecastRoutes);
router.use("/retail", retailCommerceRoutes);
router.use("/retail-transactions", requirePermission("transactions:read"), enforceStoreScope(), auditAction({ action: "RETAIL_TRANSACTION_API_WRITE", entityType: "RetailTransaction", severity: "CRITICAL" }), retailTransactionRoutes);
router.use("/audit-logs", auditRoutes);

export default router;
