import { Router } from "express";
import {authenticate } from "../../middleware/auth.middleware";
import * as controller from "./insights.controller";

const router = Router();

router.get(
  "/overview",
  authenticate,
  controller.getOverviewInsights
);

export default router;