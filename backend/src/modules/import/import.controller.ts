import { Request, Response, NextFunction } from "express";
import {
  replaceDatasetImport,
  resolveImportOrganizationId,
  validateDatasetImport,
} from "./import.service";
import { AuthRequest } from "../../types/auth.types";
import { ImportFileInput, ImportFileSource } from "./import.types";

function isValidFileSource(source: unknown): source is ImportFileSource {
  return (
    typeof source === "string" ||
    (typeof source === "object" &&
      source !== null &&
      typeof (source as { content?: unknown }).content === "string" &&
      typeof (source as { name?: unknown }).name === "string")
  );
}

function getFilesFromRequest(body: unknown): ImportFileInput {
  const files = (body as { files?: ImportFileInput } | undefined)?.files;

  if (
    !files ||
    !files.stores ||
    !files.skus ||
    !files.inventory ||
    !files.transactions
  ) {
    throw Object.assign(
      new Error(
        "Missing import files. Expected files.stores, files.skus, files.inventory, and files.transactions."
      ),
      { statusCode: 400 }
    );
  }

  if (
    !isValidFileSource(files.stores) ||
    !isValidFileSource(files.skus) ||
    !isValidFileSource(files.inventory) ||
    !isValidFileSource(files.transactions)
  ) {
    throw Object.assign(
      new Error(
        "Invalid import files payload. Each file must be a path string or an uploaded file object with name and content."
      ),
      { statusCode: 400 }
    );
  }

  return files;
}

export const validateImport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = validateDatasetImport(getFilesFromRequest(req.body));

    res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const replaceImport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = resolveImportOrganizationId(
      req.user?.organizationId
    );
    const files = getFilesFromRequest(req.body);
    const result = await replaceDatasetImport(
      organizationId,
      files
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error?.details || error?.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        data: error.details ?? null,
        message: error.message,
      });
    }

    next(error);
  }
};
