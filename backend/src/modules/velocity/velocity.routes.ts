import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./velocity.controller";

const router = Router();

router.get("/", authMiddleware, controller.getVelocity);

export default router;