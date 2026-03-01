import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./storePerformance.controller";

const router = Router();

router.get("/", authenticate, controller.getPerformance);

export default router;