import { Router, Request, Response, NextFunction } from "express";
import { getAggregatedDashboard } from "./dashboard.controller";
import { getDashboardOverview } from "./dashboard.service";
import { authenticate } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../types/auth.types";

const router = Router();

// 🔹 Overview endpoint
router.get(
  "/overview",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const start = req.query.start as string | undefined;
      const end = req.query.end as string | undefined;
      const months = req.query.months
        ? Number(req.query.months)
        : undefined;
      const range = req.query.range as "30d" | "3m" | "6m" | undefined;

      const overview = await getDashboardOverview(
        authReq.user!.organizationId,
        start,
        end,
        months,
        range,
        true
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
