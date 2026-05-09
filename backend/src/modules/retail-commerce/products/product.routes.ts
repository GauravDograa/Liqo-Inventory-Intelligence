import { Router } from "express";
import * as controller from "./product.controller";

const router = Router();

router.post("/", controller.createProduct);
router.get("/", controller.listProducts);
router.get("/:id", controller.getProduct);

export default router;
