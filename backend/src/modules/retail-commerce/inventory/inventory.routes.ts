import { Router } from "express";
import * as controller from "./inventory.controller";
import { requirePermission } from "../../../middleware/role.middleware";

const router = Router();

router.post("/", requirePermission("inventory:write"), controller.upsertInventory);
router.post("/adjustments", requirePermission("inventory:write"), controller.adjustInventory);
router.get("/", controller.listInventory);
router.get("/:id", controller.getInventory);

export default router;
