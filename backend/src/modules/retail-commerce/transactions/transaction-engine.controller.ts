import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import { validateCreateTransactionDto } from "./transaction-engine.dto";
import * as service from "./transaction-engine.service";

export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = validateCreateTransactionDto(req.body);
    const transaction = await service.createTransaction(
      req.user!.organizationId,
      dto
    );

    res.status(201).json(ok(transaction, "Transaction created"));
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (typeof req.params.id !== "string") {
      throw new BadRequestError("Transaction id is required");
    }

    const transaction = await service.getTransactionById(
      req.user!.organizationId,
      req.params.id
    );

    res.json(ok(transaction));
  } catch (error) {
    next(error);
  }
};

export const listTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(ok(await service.listTransactions(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};
