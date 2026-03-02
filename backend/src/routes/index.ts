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
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use("/auth", authRoutes);

// 🔒 Auth middleware applies to everything below
router.use(authenticate);

// 🔐 Protected routes
router.use("/dashboard", dashboardRoutes);
router.use("/deadstock", deadstockRoutes);
router.use("/insights", insightsRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/simulation", simulationRoutes);
router.use("/sku", skuRoutes);
router.use("/stores", storeRoutes);
router.use("/store-performance", storePerformanceRoutes);
router.use("/transactions", transactionRoutes);
router.use("/velocity", velocityRoutes);
router.use("/category", categoryRoutes);

export default router;