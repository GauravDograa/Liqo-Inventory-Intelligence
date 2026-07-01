import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/errors/http-errors";

type FieldType = "string" | "number" | "integer" | "boolean" | "array" | "object";

export type ValidationRule = {
  type: FieldType;
  required?: boolean;
  min?: number;
  allowed?: readonly unknown[];
};

export type ValidationSchema = Record<string, ValidationRule>;

const readSource = (req: Request, source: "body" | "query" | "params") =>
  (req[source] ?? {}) as Record<string, unknown>;

const validateValue = (field: string, value: unknown, rule: ValidationRule) => {
  if (value === undefined || value === null || value === "") {
    if (rule.required) {
      return `${field} is required`;
    }
    return null;
  }

  if (rule.type === "array" && !Array.isArray(value)) {
    return `${field} must be an array`;
  }

  if (rule.type === "object" && (typeof value !== "object" || Array.isArray(value))) {
    return `${field} must be an object`;
  }

  if (rule.type !== "array" && rule.type !== "object") {
    const actualType = rule.type === "integer" || rule.type === "number" ? "number" : rule.type;
    if (typeof value !== actualType) {
      return `${field} must be ${rule.type}`;
    }
  }

  if (rule.type === "integer" && !Number.isInteger(value)) {
    return `${field} must be an integer`;
  }

  if ((rule.type === "number" || rule.type === "integer") && rule.min !== undefined && Number(value) < rule.min) {
    return `${field} must be greater than or equal to ${rule.min}`;
  }

  if (rule.allowed && !rule.allowed.includes(value)) {
    return `${field} is invalid`;
  }

  return null;
};

export const validateRequest = (
  schema: ValidationSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const payload = readSource(req, source);
    const errors = Object.entries(schema)
      .map(([field, rule]) => validateValue(field, payload[field], rule))
      .filter(Boolean);

    if (errors.length > 0) {
      return next(new BadRequestError("Validation failed", errors));
    }

    next();
  };
};
