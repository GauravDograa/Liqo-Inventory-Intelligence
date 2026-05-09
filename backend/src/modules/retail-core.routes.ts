import { Router } from "express";
import productRoutes from "./products/product.routes";
import inventoryRoutes from "./inventory/retail-inventory.routes";
import transactionRoutes from "./transactions/transaction.routes";
import invoiceRoutes from "./invoices/invoice.routes";
import paymentRoutes from "./payments/payment.routes";
import storeRoutes from "./stores/store.routes";

const router = Router();

router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/payments", paymentRoutes);
router.use("/stores", storeRoutes);

export default router;
