import {
  ensureFilesAccessible,
  getHeaders,
  getMissingRequiredColumns,
  parseCsvFile,
  parseInventoryRow,
  parseSkuRow,
  parseStoreRow,
  parseTransactionRow,
} from "./import.mapper";
import {
  ImportDataBundle,
  ImportFileInput,
  ImportSummary,
  ImportValidationResult,
  ValidationIssue,
} from "./import.types";

export function validateImportFiles(
  files: ImportFileInput
): ImportValidationResult {
  const issues: ValidationIssue[] = ensureFilesAccessible(files);

  if (issues.some((issue) => issue.severity === "error")) {
    return {
      valid: false,
      summary: emptySummary(),
      issues,
    };
  }

  const parsedRows = {
    stores: parseCsvFile(files.stores),
    skus: parseCsvFile(files.skus),
    inventory: parseCsvFile(files.inventory),
    transactions: parseCsvFile(files.transactions),
  };

  issues.push(
    ...validateHeaders("stores", getHeaders(parsedRows.stores)),
    ...validateHeaders("skus", getHeaders(parsedRows.skus)),
    ...validateHeaders("inventory", getHeaders(parsedRows.inventory)),
    ...validateHeaders("transactions", getHeaders(parsedRows.transactions))
  );

  const data: ImportDataBundle = {
    stores: [],
    skus: [],
    inventory: [],
    transactions: [],
  };

  parsedRows.stores.forEach((row, index) =>
    safelyParse(() => parseStoreRow(row), data.stores, issues, "stores", index)
  );
  parsedRows.skus.forEach((row, index) =>
    safelyParse(() => parseSkuRow(row), data.skus, issues, "skus", index)
  );
  parsedRows.inventory.forEach((row, index) =>
    safelyParse(
      () => parseInventoryRow(row),
      data.inventory,
      issues,
      "inventory",
      index
    )
  );
  parsedRows.transactions.forEach((row, index) =>
    safelyParse(
      () => parseTransactionRow(row),
      data.transactions,
      issues,
      "transactions",
      index
    )
  );

  issues.push(
    ...validateDuplicateNumbers(
      "stores",
      data.stores.map((row) => row.externalId),
      "Store_ID"
    ),
    ...validateDuplicateNumbers(
      "skus",
      data.skus.map((row) => row.externalId),
      "SKU_ID"
    ),
    ...validateDuplicateNumbers(
      "transactions",
      data.transactions.map((row) => row.externalId),
      "Transaction_ID"
    ),
    ...validateDuplicatePairs(data.inventory),
    ...validateCrossReferences(data),
    ...validateNumericRanges(data),
    ...warnOnFallbackQuantity(parsedRows.transactions)
  );

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    summary: {
      stores: data.stores.length,
      skus: data.skus.length,
      inventory: data.inventory.length,
      transactions: data.transactions.length,
    },
    issues,
    data,
  };
}

function validateHeaders(
  file: ImportFileInputKey,
  headers: string[]
): ValidationIssue[] {
  return getMissingRequiredColumns(headers, file).map((aliases) => ({
    file,
    field: aliases[0],
    message: `Missing required column. Expected one of: ${aliases.join(", ")}`,
    severity: "error" as const,
  }));
}

function safelyParse<T>(
  parser: () => T,
  target: T[],
  issues: ValidationIssue[],
  file: ImportFileInputKey,
  index: number
) {
  try {
    target.push(parser());
  } catch (error) {
    issues.push({
      file,
      row: index + 2,
      message:
        error instanceof Error ? error.message : "Failed to parse row",
      severity: "error",
    });
  }
}

function validateDuplicateNumbers(
  file: ImportFileInputKey,
  values: number[],
  field: string
) {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }
    seen.add(value);
  });

  return Array.from(duplicates).map((value) => ({
    file,
    field,
    message: `Duplicate identifier found: ${value}`,
    severity: "error" as const,
  }));
}

function validateDuplicatePairs(data: ImportDataBundle["inventory"]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  data.forEach((row) => {
    const key = `${row.storeExternalId}_${row.skuExternalId}`;
    if (seen.has(key)) {
      duplicates.add(key);
      return;
    }
    seen.add(key);
  });

  return Array.from(duplicates).map((value) => ({
    file: "inventory" as const,
    field: "Store_ID,SKU_ID",
    message: `Duplicate inventory pair found: ${value}`,
    severity: "error" as const,
  }));
}

function validateCrossReferences(data: ImportDataBundle) {
  const storeIds = new Set(data.stores.map((row) => row.externalId));
  const skuIds = new Set(data.skus.map((row) => row.externalId));
  const issues: ValidationIssue[] = [];

  data.inventory.forEach((row, index) => {
    if (!storeIds.has(row.storeExternalId)) {
      issues.push({
        file: "inventory",
        row: index + 2,
        field: "Store_ID",
        message: `Unknown Store_ID ${row.storeExternalId}`,
        severity: "error",
      });
    }

    if (!skuIds.has(row.skuExternalId)) {
      issues.push({
        file: "inventory",
        row: index + 2,
        field: "SKU_ID",
        message: `Unknown SKU_ID ${row.skuExternalId}`,
        severity: "error",
      });
    }
  });

  data.transactions.forEach((row, index) => {
    if (!storeIds.has(row.storeExternalId)) {
      issues.push({
        file: "transactions",
        row: index + 2,
        field: "Store_ID",
        message: `Unknown Store_ID ${row.storeExternalId}`,
        severity: "error",
      });
    }

    if (!skuIds.has(row.skuExternalId)) {
      issues.push({
        file: "transactions",
        row: index + 2,
        field: "SKU_ID",
        message: `Unknown SKU_ID ${row.skuExternalId}`,
        severity: "error",
      });
    }
  });

  return issues;
}

function validateNumericRanges(data: ImportDataBundle) {
  const issues: ValidationIssue[] = [];

  data.inventory.forEach((row, index) => {
    if (row.unitsAcquired < 0 || row.unitsSaleable < 0 || row.stockAgeDays < 0) {
      issues.push({
        file: "inventory",
        row: index + 2,
        message: "Inventory values cannot be negative",
        severity: "error",
      });
    }
  });

  data.transactions.forEach((row, index) => {
    if (
      Number.isNaN(row.date.getTime()) ||
      row.sellingPriceGst < 0 ||
      row.netRevenue < 0 ||
      row.cogs < 0 ||
      row.quantity < 0
    ) {
      issues.push({
        file: "transactions",
        row: index + 2,
        message: "Transaction row has invalid date or negative numeric values",
        severity: "error",
      });
    }
  });

  data.skus.forEach((row, index) => {
    if (
      (row.mrp !== null && row.mrp < 0) ||
      row.acquisitionCost < 0 ||
      row.refurbCost < 0
    ) {
      issues.push({
        file: "skus",
        row: index + 2,
        message: "SKU monetary values cannot be negative",
        severity: "error",
      });
    }
  });

  return issues;
}

function warnOnFallbackQuantity(
  rows: Array<Record<string, string>>
): ValidationIssue[] {
  const hasQuantityColumn = rows.length
    ? Object.keys(rows[0]).some((header) =>
        ["Quantity", "Units_Sold", "Units_Saleable"].includes(header)
      )
    : false;

  if (hasQuantityColumn) {
    return [];
  }

  return [
    {
      file: "transactions",
      field: "Quantity",
      message:
        "Quantity column not found. Import will default transaction quantity to 1, which can reduce velocity accuracy.",
      severity: "warning",
    },
  ];
}

function emptySummary(): ImportSummary {
  return {
    stores: 0,
    skus: 0,
    inventory: 0,
    transactions: 0,
  };
}

type ImportFileInputKey = keyof ImportFileInput;
