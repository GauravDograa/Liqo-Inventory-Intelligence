import { Router } from "express";
import * as controller from "./inventory.controller";

const router = Router();

router.post("/", controller.upsertInventory);
router.get("/", controller.listInventory);
router.get("/:id", controller.getInventory);

export default router;
