import { Router } from "express";
import { requirePermission } from "../../middleware/role.middleware";
import * as controller from "./audit.controller";

const router = Router();

router.get("/", requirePermission("audit:read"), controller.listAuditLogs);

export default router;
