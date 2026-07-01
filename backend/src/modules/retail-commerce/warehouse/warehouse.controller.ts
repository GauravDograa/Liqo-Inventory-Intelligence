import { NextFunction, Response } from "express";
import { ok } from "../../../shared/http/api-response";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { AuthRequest } from "../../../types/auth.types";
import * as warehouseService from "./warehouse.service";
import * as transferService from "./transfer.service";
import * as replenishmentService from "./replenishment.service";

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

export const listWarehouses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await warehouseService.listWarehouses(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const createTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(201).json(
      ok(
        await transferService.createTransfer(req.user!.organizationId, req.body ?? {}),
        "Stock transfer created"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const listTransfers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.listTransfers(req.user!.organizationId, {
          status: req.query.status,
          sourceWarehouseId: req.query.sourceWarehouseId,
          destinationStoreId: req.query.destinationStoreId,
        })
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await transferService.getTransfer(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};

export const approveTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.approveTransfer(
          req.user!.organizationId,
          routeParam(req.params.id, "id"),
          transferService.parseActionInput(req.body ?? {})
        ),
        "Stock transfer approved"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const allocateTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.allocateTransfer(
          req.user!.organizationId,
          routeParam(req.params.id, "id"),
          transferService.parseActionInput(req.body ?? {})
        ),
        "Stock transfer allocated"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const dispatchTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.dispatchTransfer(
          req.user!.organizationId,
          routeParam(req.params.id, "id"),
          transferService.parseDispatchInput(req.body ?? {})
        ),
        "Stock transfer dispatched"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const markInTransit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.markInTransit(req.user!.organizationId, routeParam(req.params.id, "id")),
        "Stock transfer marked in transit"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const confirmDelivery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.confirmDelivery(
          req.user!.organizationId,
          routeParam(req.params.id, "id"),
          transferService.parseDeliveryInput(req.body ?? {})
        ),
        "Stock transfer delivered"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const cancelTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await transferService.cancelTransfer(
          req.user!.organizationId,
          routeParam(req.params.id, "id"),
          transferService.parseActionInput(req.body ?? {})
        ),
        "Stock transfer cancelled"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const listReplenishmentSuggestions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(
      ok(
        await replenishmentService.generateReplenishmentSuggestions(req.user!.organizationId, {
          storeId: typeof req.query.storeId === "string" ? req.query.storeId : undefined,
        })
      )
    );
  } catch (error) {
    next(error);
  }
};

export const createTransferFromSuggestions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(201).json(
      ok(
        await replenishmentService.createTransferFromSuggestions(req.user!.organizationId, req.body ?? {}),
        "Replenishment transfer evaluated"
      )
    );
  } catch (error) {
    next(error);
  }
};
