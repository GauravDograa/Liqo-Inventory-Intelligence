import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./transaction.controller";

const router = Router();

router.get("/", authMiddleware, controller.getTransactions);

export default router;