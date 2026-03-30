import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./import.controller";

const router = Router();

router.post("/validate", authenticate, controller.validateImport);
router.post("/replace", authenticate, controller.replaceImport);

export default router;
