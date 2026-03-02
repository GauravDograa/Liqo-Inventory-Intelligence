import { Router } from "express";

import * as controller from "./store.controller";

const router = Router();

router.get(
  "/performance",
  controller.getStorePerformance
);

export default router;