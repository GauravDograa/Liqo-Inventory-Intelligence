import { Router } from "express";
import * as controller from "./forecasting.controller";
import { requirePermission } from "../../../middleware/role.middleware";

const router = Router();

router.post("/generate", requirePermission("analytics:write"), controller.generateForecasts);
router.get("/", controller.listForecasts);
router.get("/recommendation-signals", controller.getRecommendationSignals);
router.get("/:id", controller.getForecast);

export default router;
