import { Router } from "express";
import { authenticate} from "../../middleware/auth.middleware";
import * as controller from "./deadstock.controller";

const router = Router();

router.get(
  "/summary",
  authenticate,
  controller.getDeadStockSummary
);

export default router;