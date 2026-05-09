import { Router } from "express";
import * as controller from "./category.controller";

const router = Router();

router.post("/", controller.createCategory);
router.get("/", controller.listCategories);
router.get("/:id", controller.getCategory);

export default router;
