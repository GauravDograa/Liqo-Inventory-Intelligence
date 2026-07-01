import { Router } from "express";
import * as controller from "./warehouse.controller";
import { validateRequest } from "../../../middleware/validation.middleware";
import { requirePermission } from "../../../middleware/role.middleware";

const router = Router();

router.get("/", controller.listWarehouses);

router.get("/transfers", controller.listTransfers);
router.post(
  "/transfers",
  requirePermission("warehouse:write"),
  validateRequest({
    sourceWarehouseId: { type: "string", required: true },
    destinationStoreId: { type: "string", required: true },
    items: { type: "array", required: true },
  }),
  controller.createTransfer
);
router.get("/transfers/:id", controller.getTransfer);
router.post("/transfers/:id/approve", requirePermission("warehouse:write"), controller.approveTransfer);
router.post("/transfers/:id/allocate", requirePermission("warehouse:write"), controller.allocateTransfer);
router.post("/transfers/:id/dispatch", requirePermission("warehouse:write"), controller.dispatchTransfer);
router.post("/transfers/:id/in-transit", requirePermission("warehouse:write"), controller.markInTransit);
router.post("/transfers/:id/deliver", requirePermission("warehouse:write"), controller.confirmDelivery);
router.post("/transfers/:id/cancel", requirePermission("warehouse:write"), controller.cancelTransfer);

router.get("/replenishment/suggestions", controller.listReplenishmentSuggestions);
router.post("/replenishment/transfers", requirePermission("warehouse:write"), controller.createTransferFromSuggestions);

export default router;
