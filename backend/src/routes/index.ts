import { Router } from "express";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";
import deadstockRoutes from "../modules/deadstock/deadstock.routes";
import authRoutes from "../modules/auth/auth.routes";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/deadstock", deadstockRoutes);
router.use("/auth", authRoutes);
router.use(authenticate);
export default router;