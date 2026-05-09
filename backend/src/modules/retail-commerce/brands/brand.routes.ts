import { Router } from "express";
import * as controller from "./brand.controller";

const router = Router();

router.post("/", controller.createBrand);
router.get("/", controller.listBrands);
router.get("/:id", controller.getBrand);

export default router;
