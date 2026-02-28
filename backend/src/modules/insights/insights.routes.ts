import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./insights.controller";

const router = Router();

router.get(
  "/overview",
  authMiddleware,
  controller.getOverviewInsights
);

export default router;