import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./storePerformance.controller";

const router = Router();

router.get("/", authMiddleware, controller.getPerformance);

export default router;