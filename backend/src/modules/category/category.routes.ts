import { Router } from "express";
import { getCategoryPerformance } from "./category.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/performance", authenticate, getCategoryPerformance);

export default router;