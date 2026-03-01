import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./store.controller";

const router = Router();

router.get(
  "/performance",
  authenticate,
  controller.getStorePerformance
);

export default router;