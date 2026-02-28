import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./inventory.controller";

const router = Router();

router.get("/", authMiddleware, controller.getInventory);

export default router;