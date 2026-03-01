import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./sku.controller";

const router = Router();

router.get(
  "/performance",
  authenticate,
  controller.getSkuPerformance
);

export default router;