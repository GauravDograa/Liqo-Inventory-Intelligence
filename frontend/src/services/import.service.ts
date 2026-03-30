import { api } from "@/lib/axios";
import {
  ImportFilesInput,
  ImportReplaceResult,
  ImportValidationResult,
} from "@/types/import.types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function postImportRequest<T>(
  url: string,
  files: ImportFilesInput
): Promise<ApiEnvelope<T>> {
  const response = await api.post<ApiEnvelope<T>>(
    url,
    { files },
    {
      validateStatus: () => true,
    }
  );

  if (response.status >= 500) {
    throw new Error(response.data?.message || "Import request failed");
  }

  return response.data;
}

export async function validateDatasetImport(files: ImportFilesInput) {
  return postImportRequest<ImportValidationResult>("/import/validate", files);
}

export async function replaceDatasetImport(files: ImportFilesInput) {
  return postImportRequest<ImportReplaceResult>("/import/replace", files);
}
