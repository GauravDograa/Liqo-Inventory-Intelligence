export interface UploadedImportFilePayload {
  name: string;
  content: string;
}

export type ImportFileSource = string | UploadedImportFilePayload;

export interface ImportFilesInput {
  stores: ImportFileSource;
  skus: ImportFileSource;
  inventory: ImportFileSource;
  transactions: ImportFileSource;
}

export interface ImportIssue {
  file: keyof ImportFilesInput;
  row?: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

export interface ImportSummary {
  stores: number;
  skus: number;
  inventory: number;
  transactions: number;
}

export interface ImportValidationResult {
  valid: boolean;
  summary: ImportSummary;
  issues: ImportIssue[];
}

export interface ImportReplaceResult {
  organizationId: string;
  summary: ImportSummary;
  issues: ImportIssue[];
}
