import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./simulation.controller";

const router = Router();

router.get(
  "/run",
  authMiddleware,
  controller.runSimulation
);

export default router;