import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./transaction.controller";
import transactionEngineRoutes from "../retail-commerce/transactions/transaction-engine.routes";

const router = Router();

router.use("/", transactionEngineRoutes);
router.get("/", authenticate, controller.getTransactions);

export default router;
