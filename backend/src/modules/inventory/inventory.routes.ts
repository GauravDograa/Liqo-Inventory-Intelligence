import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./inventory.controller";

const router = Router();

router.get("/", authenticate, controller.getInventory);

export default router;