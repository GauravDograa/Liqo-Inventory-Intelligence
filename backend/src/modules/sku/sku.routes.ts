import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./sku.controller";

const router = Router();

router.get(
  "/performance",
  authMiddleware,
  controller.getSkuPerformance
);

export default router;