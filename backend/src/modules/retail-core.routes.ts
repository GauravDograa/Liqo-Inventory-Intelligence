import { Router } from "express";
import productRoutes from "./products/product.routes";
import inventoryRoutes from "./inventory/retail-inventory.routes";
import transactionRoutes from "./transactions/transaction.routes";
import invoiceRoutes from "./invoices/invoice.routes";
import paymentRoutes from "./payments/payment.routes";
import storeRoutes from "./stores/store.routes";
import { auditAction } from "../middleware/audit.middleware";
import { enforceStoreScope, requirePermission } from "../middleware/role.middleware";

const router = Router();

router.use("/products", requirePermission("catalog:read"), productRoutes);
router.use("/inventory", requirePermission("inventory:read"), enforceStoreScope(), auditAction({ action: "INVENTORY_API_WRITE", entityType: "Inventory", severity: "CRITICAL", storeIdFrom: "body.storeId" }), inventoryRoutes);
router.use("/transactions", requirePermission("transactions:read"), enforceStoreScope(), auditAction({ action: "TRANSACTION_API_WRITE", entityType: "RetailTransaction", severity: "CRITICAL", storeIdFrom: "body.storeId" }), transactionRoutes);
router.use("/invoices", requirePermission("billing:read"), enforceStoreScope(), auditAction({ action: "INVOICE_API_WRITE", entityType: "Invoice", severity: "CRITICAL", storeIdFrom: "body.storeId" }), invoiceRoutes);
router.use("/payments", requirePermission("billing:read"), auditAction({ action: "PAYMENT_API_WRITE", entityType: "Payment", severity: "CRITICAL" }), paymentRoutes);
router.use("/stores", requirePermission("catalog:read"), storeRoutes);

export default router;
