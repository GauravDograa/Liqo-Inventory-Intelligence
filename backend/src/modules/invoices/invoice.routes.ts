import { Router } from "express";
import * as controller from "./invoice.controller";

const router = Router();

router.get("/", controller.listInvoices);
router.get("/:id/pdf", controller.downloadInvoicePdf);
router.get("/:id", controller.getInvoice);

export default router;
