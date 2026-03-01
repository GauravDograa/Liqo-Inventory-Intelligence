import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./transaction.controller";

const router = Router();

router.get("/", authenticate, controller.getTransactions);

export default router;