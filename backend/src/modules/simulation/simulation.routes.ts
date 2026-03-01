import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./simulation.controller";

const router = Router();

router.get(
  "/run",
  authenticate,
  controller.runSimulation
);

export default router;