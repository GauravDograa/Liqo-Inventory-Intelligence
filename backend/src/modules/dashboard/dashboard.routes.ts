import { Router, Request, Response, NextFunction } from "express";
import { getAggregatedDashboard } from "./dashboard.controller";
import { getDashboardOverview } from "./dashboard.service";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// 🔹 Overview endpoint
router.get(
  "/overview",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await getDashboardOverview();
      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 🔹 Full dashboard
router.get("/", authMiddleware, getAggregatedDashboard);

export default router;