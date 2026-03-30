export interface UploadedImportFile {
  name: string;
  content: string;
}

export type ImportFileSource = string | UploadedImportFile;

export interface ImportFileInput {
  stores: ImportFileSource;
  skus: ImportFileSource;
  inventory: ImportFileSource;
  transactions: ImportFileSource;
}

export interface ImportRequestBody {
  files: ImportFileInput;
}

export interface ValidationIssue {
  file: keyof ImportFileInput;
  row?: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

export interface ParsedStoreRow {
  externalId: number;
  code: string;
  name: string;
  region: string | null;
  city: string | null;
  cityType: string | null;
}

export interface ParsedSkuRow {
  externalId: number;
  category: string;
  mrp: number | null;
  condition: string | null;
  acquisitionCost: number;
  refurbCost: number;
}

export interface ParsedInventoryRow {
  storeExternalId: number;
  skuExternalId: number;
  unitsAcquired: number;
  unitsSaleable: number;
  stockAgeDays: number;
}

export interface ParsedTransactionRow {
  externalId: number;
  storeExternalId: number;
  skuExternalId: number;
  date: Date;
  sellingPriceGst: number;
  netRevenue: number;
  cogs: number;
  grossMarginPct: number;
  inventoryAgeBucket: string;
  quantity: number;
}

export interface ImportDataBundle {
  stores: ParsedStoreRow[];
  skus: ParsedSkuRow[];
  inventory: ParsedInventoryRow[];
  transactions: ParsedTransactionRow[];
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
  issues: ValidationIssue[];
  data?: ImportDataBundle;
}

export interface ImportReplaceResult {
  organizationId: string;
  summary: ImportSummary;
  issues: ValidationIssue[];
}
