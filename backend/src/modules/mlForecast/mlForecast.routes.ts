import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./mlForecast.controller";

const router = Router();

router.get("/contract", controller.getContract);
router.get("/selection", controller.getModelSelection);
router.get("/history", controller.getModelHistory);
router.get("/training-dataset", authenticate, controller.getTrainingDataset);
router.post("/predict", controller.predictMock);
router.post("/mock-predict", controller.predictMock);

export default router;
