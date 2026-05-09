import { Router } from "express";
import * as controller from "./store.controller";

const router = Router();

router.post("/", controller.createStore);
router.get("/", controller.listStores);
router.get("/:id", controller.getStore);

export default router;
