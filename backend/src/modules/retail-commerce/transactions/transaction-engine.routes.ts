import { Router } from "express";
import * as controller from "./transaction-engine.controller";
import { requirePermission } from "../../../middleware/role.middleware";

const router = Router();

router.post("/", requirePermission("transactions:write"), controller.createTransaction);
router.post("/create", requirePermission("transactions:write"), controller.createTransaction);
router.get("/", controller.listTransactions);
router.get("/:id", controller.getTransactionById);

export default router;
