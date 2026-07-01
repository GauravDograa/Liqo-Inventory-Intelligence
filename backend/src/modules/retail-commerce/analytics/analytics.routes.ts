import { Router } from "express";
import * as controller from "./analytics.controller";
import { requirePermission } from "../../../middleware/role.middleware";

const router = Router();

router.post("/sync", requirePermission("analytics:write"), controller.syncAnalytics);
router.get("/summary", controller.getDashboardSummary);

export default router;
