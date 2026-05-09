import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/auth.types";
import { BadRequestError } from "../../../shared/errors/http-errors";
import { ok } from "../../../shared/http/api-response";
import * as service from "./category.service";

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestError(`${field} is required`);
  }

  return value.trim();
};

const routeParam = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} is required`);
  }

  return value;
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await service.createCategory(req.user!.organizationId, {
      name: requiredString(req.body.name, "name"),
      code: typeof req.body.code === "string" ? req.body.code.trim() : undefined,
      parentId: typeof req.body.parentId === "string" ? req.body.parentId : undefined,
    });

    res.status(201).json(ok(category, "Category created"));
  } catch (error) {
    next(error);
  }
};

export const listCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.listCategories(req.user!.organizationId)));
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(ok(await service.getCategory(req.user!.organizationId, routeParam(req.params.id, "id"))));
  } catch (error) {
    next(error);
  }
};
