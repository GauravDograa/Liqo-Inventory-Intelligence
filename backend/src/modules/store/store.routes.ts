import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./store.controller";

const router = Router();

router.get(
  "/performance",
  authMiddleware,
  controller.getStorePerformance
);

export default router;