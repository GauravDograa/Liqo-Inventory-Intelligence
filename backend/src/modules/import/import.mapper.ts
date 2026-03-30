import fs from "fs";
import path from "path";
import {
  ImportFileInput,
  ImportFileSource,
  ParsedInventoryRow,
  ParsedSkuRow,
  ParsedStoreRow,
  ParsedTransactionRow,
  UploadedImportFile,
  ValidationIssue,
} from "./import.types";

type CsvRow = Record<string, string>;

const COLUMN_ALIASES = {
  stores: {
    id: ["Store_ID"],
    name: ["Store_Name"],
    region: ["Region"],
    city: ["City"],
    cityType: ["City_Type"],
  },
  skus: {
    id: ["SKU_ID"],
    category: ["Category"],
    mrp: ["MRP"],
    condition: ["Condition"],
    acquisitionCost: ["Acquisition_Cost"],
    refurbCost: ["Refurb_Cost"],
  },
  inventory: {
    storeId: ["Store_ID"],
    skuId: ["SKU_ID"],
    unitsAcquired: ["Units_Acquired"],
    unitsSaleable: ["Units_Saleable"],
    stockAgeDays: ["Stock_Age_Days"],
  },
  transactions: {
    id: ["Transaction_ID"],
    date: ["Date"],
    storeId: ["Store_ID"],
    skuId: ["SKU_ID"],
    inventoryAgeBucket: ["Inventory_Age_Bucket"],
    sellingPriceGst: ["Selling_Price_GST"],
    netRevenue: ["Net_Revenue"],
    cogs: ["COGS"],
    grossMarginPct: ["True_Gross_Margin_%", "True_Gross_Margin_percent"],
    quantity: ["Quantity", "Units_Sold", "Units_Saleable"],
  },
} as const;

export function resolveImportPath(filePath: string) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

function isUploadedFile(source: ImportFileSource): source is UploadedImportFile {
  return typeof source === "object" && source !== null;
}

function readCsvSource(source: ImportFileSource) {
  if (isUploadedFile(source)) {
    return source.content;
  }

  return fs.readFileSync(resolveImportPath(source), "utf8");
}

export function ensureFilesAccessible(
  files: ImportFileInput
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  (Object.keys(files) as Array<keyof ImportFileInput>).forEach((key) => {
    const source = files[key];

    if (isUploadedFile(source)) {
      if (!source.content?.trim()) {
        issues.push({
          file: key,
          message: `Uploaded file ${source.name || key} is empty`,
          severity: "error",
        });
      }
      return;
    }

    const fullPath = resolveImportPath(source);

    if (!fs.existsSync(fullPath)) {
      issues.push({
        file: key,
        message: `File not found: ${fullPath}`,
        severity: "error",
      });
    }
  });

  return issues;
}

export function parseCsvFile(source: ImportFileSource): CsvRow[] {
  const content = readCsvSource(source);
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (!lines.length) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

export function parseStoreRow(
  row: CsvRow
): ParsedStoreRow {
  return {
    externalId: Number(getRequiredValue(row, COLUMN_ALIASES.stores.id)),
    code: String(getRequiredValue(row, COLUMN_ALIASES.stores.id)),
    name: getRequiredValue(row, COLUMN_ALIASES.stores.name),
    region: getOptionalValue(row, COLUMN_ALIASES.stores.region),
    city: getOptionalValue(row, COLUMN_ALIASES.stores.city),
    cityType: getOptionalValue(row, COLUMN_ALIASES.stores.cityType),
  };
}

export function parseSkuRow(row: CsvRow): ParsedSkuRow {
  return {
    externalId: Number(getRequiredValue(row, COLUMN_ALIASES.skus.id)),
    category: getRequiredValue(row, COLUMN_ALIASES.skus.category),
    mrp: toNullableNumber(getOptionalValue(row, COLUMN_ALIASES.skus.mrp)),
    condition: getOptionalValue(row, COLUMN_ALIASES.skus.condition),
    acquisitionCost: Number(
      getRequiredValue(row, COLUMN_ALIASES.skus.acquisitionCost)
    ),
    refurbCost: Number(
      getRequiredValue(row, COLUMN_ALIASES.skus.refurbCost)
    ),
  };
}

export function parseInventoryRow(
  row: CsvRow
): ParsedInventoryRow {
  return {
    storeExternalId: Number(
      getRequiredValue(row, COLUMN_ALIASES.inventory.storeId)
    ),
    skuExternalId: Number(
      getRequiredValue(row, COLUMN_ALIASES.inventory.skuId)
    ),
    unitsAcquired: Number(
      getRequiredValue(row, COLUMN_ALIASES.inventory.unitsAcquired)
    ),
    unitsSaleable: Number(
      getRequiredValue(row, COLUMN_ALIASES.inventory.unitsSaleable)
    ),
    stockAgeDays: Number(
      getRequiredValue(row, COLUMN_ALIASES.inventory.stockAgeDays)
    ),
  };
}

export function parseTransactionRow(
  row: CsvRow
): ParsedTransactionRow {
  const quantityValue = getOptionalValue(
    row,
    COLUMN_ALIASES.transactions.quantity
  );

  return {
    externalId: Number(getRequiredValue(row, COLUMN_ALIASES.transactions.id)),
    storeExternalId: Number(
      getRequiredValue(row, COLUMN_ALIASES.transactions.storeId)
    ),
    skuExternalId: Number(
      getRequiredValue(row, COLUMN_ALIASES.transactions.skuId)
    ),
    date: new Date(getRequiredValue(row, COLUMN_ALIASES.transactions.date)),
    sellingPriceGst: Number(
      getRequiredValue(row, COLUMN_ALIASES.transactions.sellingPriceGst)
    ),
    netRevenue: Number(
      getRequiredValue(row, COLUMN_ALIASES.transactions.netRevenue)
    ),
    cogs: Number(getRequiredValue(row, COLUMN_ALIASES.transactions.cogs)),
    grossMarginPct: Number(
      getRequiredValue(row, COLUMN_ALIASES.transactions.grossMarginPct)
    ),
    inventoryAgeBucket: getRequiredValue(
      row,
      COLUMN_ALIASES.transactions.inventoryAgeBucket
    ),
    quantity: quantityValue ? Number(quantityValue) : 1,
  };
}

export function getHeaders(rows: CsvRow[]) {
  return rows.length ? Object.keys(rows[0]) : [];
}

export function getMissingRequiredColumns(
  headers: string[],
  file: keyof typeof COLUMN_ALIASES
) {
  const requiredColumnsByFile: Record<
    keyof typeof COLUMN_ALIASES,
    readonly (readonly string[])[]
  > = {
    stores: [
      COLUMN_ALIASES.stores.id,
      COLUMN_ALIASES.stores.name,
    ],
    skus: [
      COLUMN_ALIASES.skus.id,
      COLUMN_ALIASES.skus.category,
      COLUMN_ALIASES.skus.mrp,
      COLUMN_ALIASES.skus.acquisitionCost,
      COLUMN_ALIASES.skus.refurbCost,
    ],
    inventory: [
      COLUMN_ALIASES.inventory.storeId,
      COLUMN_ALIASES.inventory.skuId,
      COLUMN_ALIASES.inventory.unitsAcquired,
      COLUMN_ALIASES.inventory.unitsSaleable,
      COLUMN_ALIASES.inventory.stockAgeDays,
    ],
    transactions: [
      COLUMN_ALIASES.transactions.id,
      COLUMN_ALIASES.transactions.date,
      COLUMN_ALIASES.transactions.storeId,
      COLUMN_ALIASES.transactions.skuId,
      COLUMN_ALIASES.transactions.inventoryAgeBucket,
      COLUMN_ALIASES.transactions.sellingPriceGst,
      COLUMN_ALIASES.transactions.netRevenue,
      COLUMN_ALIASES.transactions.cogs,
      COLUMN_ALIASES.transactions.grossMarginPct,
    ],
  };

  const requiredColumns = requiredColumnsByFile[file];

  return requiredColumns.filter(
    (aliases) => !aliases.some((alias) => headers.includes(alias))
  );
}

function getRequiredValue(row: CsvRow, aliases: readonly string[]) {
  const value = getOptionalValue(row, aliases);

  if (value === null || value === "") {
    throw new Error(`Missing required value for ${aliases[0]}`);
  }

  return value;
}

function getOptionalValue(row: CsvRow, aliases: readonly string[]) {
  for (const alias of aliases) {
    if (alias in row) {
      const value = row[alias]?.trim();
      return value ? value : null;
    }
  }

  return null;
}

function toNullableNumber(value: string | null) {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}
