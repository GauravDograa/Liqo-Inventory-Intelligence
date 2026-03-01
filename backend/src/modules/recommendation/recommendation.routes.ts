import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./recommendation.controller";

const router = Router();

router.get("/", authenticate, controller.getRecommendations);

export default router;