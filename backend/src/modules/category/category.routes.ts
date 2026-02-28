import { Router } from "express";
import { getCategoryPerformance } from "./category.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/performance", authMiddleware, getCategoryPerformance);

export default router;