import { Router, Request, Response, NextFunction } from "express";
import { getAggregatedDashboard } from "./dashboard.controller";
import { getDashboardOverview } from "./dashboard.service";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// 🔹 Overview endpoint
router.get(
  "/overview",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const start = req.query.start as string | undefined;
      const end = req.query.end as string | undefined;
      const months = req.query.months
        ? Number(req.query.months)
        : undefined;

      const overview = await getDashboardOverview(
        start,
        end,
        months
      );
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
router.get("/", authenticate, getAggregatedDashboard);

export default router;
