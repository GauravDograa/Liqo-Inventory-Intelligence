import { Router } from "express";
import brandRoutes from "./brands/brand.routes";
import categoryRoutes from "./categories/category.routes";
import productRoutes from "./products/product.routes";
import storeRoutes from "./stores/store.routes";
import inventoryRoutes from "./inventory/inventory.routes";
import customerRoutes from "./customers/customer.routes";
import transactionRoutes from "./transactions/transaction-engine.routes";

const router = Router();

router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/stores", storeRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/customers", customerRoutes);
router.use("/transactions", transactionRoutes);

export default router;
