import { Router } from "express";
import {authenticate } from "../../middleware/auth.middleware";
import * as controller from "./insights.controller";

const router = Router();

router.get(
  "/overview",
  authenticate,
  controller.getOverviewInsights
);
router.get(
  "/ai-summary",
  authenticate,
  controller.getAiInsightsSummary
);
router.post(
  "/ask",
  authenticate,
  controller.askAiInsightsQuestion
);

export default router;
