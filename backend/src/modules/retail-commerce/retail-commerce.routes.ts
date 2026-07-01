import { Router } from "express";
import brandRoutes from "./brands/brand.routes";
import categoryRoutes from "./categories/category.routes";
import productRoutes from "./products/product.routes";
import storeRoutes from "./stores/store.routes";
import inventoryRoutes from "./inventory/inventory.routes";
import customerRoutes from "./customers/customer.routes";
import transactionRoutes from "./transactions/transaction-engine.routes";
import analyticsRoutes from "./analytics/analytics.routes";
import recommendationRoutes from "./recommendations/recommendation-engine.routes";
import forecastingRoutes from "./forecasting/forecasting.routes";
import warehouseRoutes from "./warehouse/warehouse.routes";
import invoiceRoutes from "../invoices/invoice.routes";
import paymentRoutes from "../payments/payment.routes";
import { auditAction } from "../../middleware/audit.middleware";
import { enforceStoreScope, requirePermission } from "../../middleware/role.middleware";

const router = Router();

router.use("/brands", requirePermission("catalog:read"), brandRoutes);
router.use("/categories", requirePermission("catalog:read"), categoryRoutes);
router.use("/products", requirePermission("catalog:read"), productRoutes);
router.use("/stores", requirePermission("catalog:read"), storeRoutes);
router.use(
  "/inventory",
  requirePermission("inventory:read"),
  enforceStoreScope(),
  auditAction({ action: "INVENTORY_API_WRITE", entityType: "Inventory", severity: "CRITICAL", storeIdFrom: "body.storeId" }),
  inventoryRoutes
);
router.use("/customers", requirePermission("transactions:read"), customerRoutes);
router.use(
  "/transactions",
  requirePermission("transactions:read"),
  enforceStoreScope(),
  auditAction({ action: "TRANSACTION_API_WRITE", entityType: "RetailTransaction", severity: "CRITICAL", storeIdFrom: "body.storeId" }),
  transactionRoutes
);
router.use("/invoices", requirePermission("billing:read"), enforceStoreScope(), invoiceRoutes);
router.use("/payments", requirePermission("billing:read"), paymentRoutes);
router.use("/analytics", requirePermission("analytics:read"), enforceStoreScope(), analyticsRoutes);
router.use("/recommendations", requirePermission("inventory:read"), enforceStoreScope(), recommendationRoutes);
router.use("/forecasting", requirePermission("analytics:read"), enforceStoreScope(), forecastingRoutes);
router.use(
  "/warehouse",
  requirePermission("warehouse:read"),
  enforceStoreScope({ allowWarehouseSource: true }),
  auditAction({ action: "WAREHOUSE_API_WRITE", entityType: "StockTransfer", severity: "CRITICAL", storeIdFrom: "body.destinationStoreId" }),
  warehouseRoutes
);

export default router;
