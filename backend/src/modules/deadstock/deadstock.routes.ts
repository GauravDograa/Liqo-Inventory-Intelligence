import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./deadstock.controller";

const router = Router();

router.get(
  "/summary",
  authMiddleware,
  controller.getDeadStockSummary
);

export default router;