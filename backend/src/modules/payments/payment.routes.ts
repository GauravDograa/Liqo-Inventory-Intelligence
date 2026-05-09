import { Router } from "express";
import * as controller from "./payment.controller";

const router = Router();

router.get("/", controller.listPayments);
router.get("/:id", controller.getPayment);

export default router;
