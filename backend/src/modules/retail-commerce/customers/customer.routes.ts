import { Router } from "express";
import * as controller from "./customer.controller";

const router = Router();

router.post("/", controller.createCustomer);
router.get("/", controller.listCustomers);
router.get("/:id", controller.getCustomer);

export default router;
