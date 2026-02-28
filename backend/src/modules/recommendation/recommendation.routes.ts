import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./recommendation.controller";

const router = Router();

router.get("/", authMiddleware, controller.getRecommendations);

export default router;