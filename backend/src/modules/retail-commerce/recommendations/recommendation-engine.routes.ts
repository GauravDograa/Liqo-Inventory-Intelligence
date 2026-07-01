import { Router } from "express";
import * as controller from "./recommendation-engine.controller";
import { requirePermission } from "../../../middleware/role.middleware";

const router = Router();

router.post("/generate", requirePermission("inventory:write"), controller.generateRecommendations);
router.get("/", controller.listRecommendations);
router.get("/:id", controller.getRecommendation);
router.post("/:id/decision", requirePermission("inventory:write"), controller.recordDecision);

export default router;
