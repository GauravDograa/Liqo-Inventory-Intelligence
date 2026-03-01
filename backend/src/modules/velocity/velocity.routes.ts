import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./velocity.controller";

const router = Router();

router.get("/", authenticate, controller.getVelocity);

export default router;