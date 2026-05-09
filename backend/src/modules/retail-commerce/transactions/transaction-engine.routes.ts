import { Router } from "express";
import * as controller from "./transaction-engine.controller";

const router = Router();

router.post("/", controller.createTransaction);
router.post("/create", controller.createTransaction);
router.get("/", controller.listTransactions);
router.get("/:id", controller.getTransactionById);

export default router;
