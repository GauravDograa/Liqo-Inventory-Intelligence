"use client";

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Upload,
} from "lucide-react";
import {
  replaceDatasetImport,
  validateDatasetImport,
} from "@/services/import.service";
import {
  ImportFilesInput,
  ImportIssue,
  ImportReplaceResult,
  ImportValidationResult,
  UploadedImportFilePayload,
} from "@/types/import.types";

type ImportFileKey = keyof ImportFilesInput;
type UploadState = Partial<Record<ImportFileKey, File>>;

const fieldMeta: Array<{
  key: ImportFileKey;
  label: string;
  acceptLabel: string;
  hint: string;
}> = [
  {
    key: "stores",
    label: "Store master",
    acceptLabel: "store_master.csv",
    hint: "Contains store identifiers and names.",
  },
  {
    key: "skus",
    label: "SKU master",
    acceptLabel: "sku_master.csv",
    hint: "Contains category, MRP, and cost values.",
  },
  {
    key: "inventory",
    label: "Inventory master",
    acceptLabel: "inventory_master.csv",
    hint: "Contains current stock and aging by store and SKU.",
  },
  {
    key: "transactions",
    label: "Transactions",
    acceptLabel: "transactions.csv",
    hint: "Contains sales, revenue, margin, and age bucket history.",
  },
];

const queryKeysToRefresh = [
  ["dashboard-overview"],
  ["dashboard", "category-performance"],
  ["deadstock"],
  ["insights-overview"],
  ["inventory"],
  ["recommendations"],
  ["revenue-trend"],
  ["store-performance"],
];

export default function ImportPage() {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadState>({});
  const [validationResult, setValidationResult] =
    useState<ImportValidationResult | null>(null);
  const [replaceResult, setReplaceResult] =
    useState<ImportReplaceResult | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const validateMutation = useMutation({
    mutationFn: async (inputFiles: UploadState) =>
      validateDatasetImport(await buildImportPayload(inputFiles)),
    onSuccess: (response) => {
      if (response.data) {
        setValidationResult(response.data);
      }
      setReplaceResult(null);
      setServerMessage(
        response.success
          ? "Dataset validation passed. You can replace the current organization dataset now."
          : response.message || "Validation finished with issues."
      );
    },
    onError: (error) => {
      setServerMessage(
        error instanceof Error ? error.message : "Validation failed"
      );
    },
  });

  const replaceMutation = useMutation({
    mutationFn: async (inputFiles: UploadState) =>
      replaceDatasetImport(await buildImportPayload(inputFiles)),
    onSuccess: async (response) => {
      setReplaceResult(response.data);
      setValidationResult((current) =>
        current
          ? {
              ...current,
              summary: response.data.summary,
              issues: response.data.issues,
              valid: !response.data.issues.some(
                (issue) => issue.severity === "error"
              ),
            }
          : null
      );
      setServerMessage(
        response.success
          ? "Dataset replaced successfully. Analytics queries are refreshing now."
          : response.message || "Replace request completed with issues."
      );

      await Promise.all(
        queryKeysToRefresh.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      );
    },
    onError: (error) => {
      setServerMessage(
        error instanceof Error ? error.message : "Replace request failed"
      );
    },
  });

  const issuesToShow = useMemo(() => {
    if (replaceResult) {
      return replaceResult.issues;
    }

    return validationResult?.issues ?? [];
  }, [replaceResult, validationResult]);

  const hasValidationErrors = issuesToShow.some(
    (issue) => issue.severity === "error"
  );
  const summary = replaceResult?.summary || validationResult?.summary || null;
  const allFilesSelected = fieldMeta.every((field) => files[field.key]);

  const handleFilePick = (
    key: ImportFileKey,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    setFiles((current) => ({
      ...current,
      [key]: nextFile,
    }));
  };

  const handleDrop = (key: ImportFileKey, event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];

    if (!nextFile) {
      return;
    }

    setFiles((current) => ({
      ...current,
      [key]: nextFile,
    }));
  };

  const handleValidate = () => {
    setServerMessage(null);
    setReplaceResult(null);
    validateMutation.mutate(files);
  };

  const handleReplace = () => {
    setServerMessage(null);
    replaceMutation.mutate(files);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-8 text-white shadow-md">
        <h1 className="text-2xl font-semibold">Dataset Import Center</h1>
        <p className="mt-2 max-w-3xl text-sm text-orange-100">
          Upload fresh CSV files, validate the structure, replace the current
          organization dataset, and refresh the analytics across the platform.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Upload files
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Drag and drop each CSV file or browse manually. The files are
                read in the browser and sent to the backend for validation and
                import.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFiles({})}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
            >
              <RefreshCw size={16} />
              Clear files
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {fieldMeta.map((field) => (
              <UploadDropzone
                key={field.key}
                label={field.label}
                acceptLabel={field.acceptLabel}
                hint={field.hint}
                file={files[field.key]}
                onFileChange={(event) => handleFilePick(field.key, event)}
                onDrop={(event) => handleDrop(field.key, event)}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={
                !allFilesSelected ||
                validateMutation.isPending ||
                replaceMutation.isPending
              }
              onClick={handleValidate}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <FileSpreadsheet size={16} />
              {validateMutation.isPending ? "Validating..." : "Validate dataset"}
            </button>

            <button
              type="button"
              disabled={
                replaceMutation.isPending ||
                validateMutation.isPending ||
                !validationResult?.valid
              }
              onClick={handleReplace}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              <Upload size={16} />
              {replaceMutation.isPending ? "Replacing..." : "Replace dataset"}
            </button>
          </div>

          {serverMessage ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {serverMessage}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Import status
                </h2>
                <p className="text-sm text-slate-500">
                  Validation must pass before replace becomes available.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <StatusRow
                label="Files selected"
                tone={allFilesSelected ? "success" : "idle"}
                value={allFilesSelected ? "Complete" : "Pending"}
              />
              <StatusRow
                label="Validation"
                tone={
                  validationResult
                    ? validationResult.valid
                      ? "success"
                      : "warning"
                    : "idle"
                }
                value={
                  validationResult
                    ? validationResult.valid
                      ? "Ready"
                      : "Needs review"
                    : "Not run yet"
                }
              />
              <StatusRow
                label="Replace"
                tone={replaceResult ? "success" : "idle"}
                value={replaceResult ? "Completed" : "Waiting"}
              />
              <StatusRow
                label="Warnings"
                tone={
                  issuesToShow.some((issue) => issue.severity === "warning")
                    ? "warning"
                    : "idle"
                }
                value={String(
                  issuesToShow.filter((issue) => issue.severity === "warning")
                    .length
                )}
              />
              <StatusRow
                label="Errors"
                tone={hasValidationErrors ? "danger" : "idle"}
                value={String(
                  issuesToShow.filter((issue) => issue.severity === "error")
                    .length
                )}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Current summary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Counts from the latest validation or replace run.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <SummaryCard label="Stores" value={summary?.stores ?? 0} />
              <SummaryCard label="SKUs" value={summary?.skus ?? 0} />
              <SummaryCard label="Inventory rows" value={summary?.inventory ?? 0} />
              <SummaryCard
                label="Transactions"
                value={summary?.transactions ?? 0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Validation issues
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review warnings before replacing. Errors must be resolved first.
            </p>
          </div>

          {issuesToShow.length === 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={16} />
              No issues
            </div>
          ) : null}
        </div>

        {issuesToShow.length === 0 ? null : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[0.9fr_0.7fr_0.7fr_2.8fr] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>File</span>
              <span>Severity</span>
              <span>Row / Field</span>
              <span>Message</span>
            </div>

            <div className="divide-y divide-slate-100">
              {issuesToShow.map((issue, index) => (
                <IssueRow
                  key={`${issue.file}-${issue.field}-${issue.row}-${index}`}
                  issue={issue}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "idle" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    idle: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
        {value}
      </span>
    </div>
  );
}

function IssueRow({ issue }: { issue: ImportIssue }) {
  const tone =
    issue.severity === "error"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div className="grid grid-cols-[0.9fr_0.7fr_0.7fr_2.8fr] gap-4 px-5 py-4 text-sm text-slate-700">
      <span className="font-medium capitalize">{issue.file}</span>
      <span>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
          <AlertTriangle size={14} />
          {issue.severity}
        </span>
      </span>
      <span className="text-slate-500">
        {issue.row ? `Row ${issue.row}` : issue.field || "General"}
      </span>
      <span>{issue.message}</span>
    </div>
  );
}

function UploadDropzone({
  label,
  acceptLabel,
  hint,
  file,
  onFileChange,
  onDrop,
}: {
  label: string;
  acceptLabel: string;
  hint: string;
  file?: File;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
}) {
  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-orange-300 hover:bg-orange-50/50"
    >
      <input
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-white p-3 text-orange-500 shadow-sm">
          <Upload size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs text-slate-500">
            Drag and drop or click to select `{acceptLabel}`
          </p>
          <p className="mt-2 text-xs text-slate-500">{hint}</p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {file ? (
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <p className="text-slate-400">No file selected yet</p>
            )}
          </div>
        </div>
      </div>
    </label>
  );
}

async function buildImportPayload(files: UploadState): Promise<ImportFilesInput> {
  const requiredFiles = ["stores", "skus", "inventory", "transactions"] as const;

  const entries = await Promise.all(
    requiredFiles.map(async (key) => {
      const file = files[key];

      if (!file) {
        throw new Error(`Missing file for ${key}`);
      }

      const content = await file.text();
      const payload: UploadedImportFilePayload = {
        name: file.name,
        content,
      };

      return [key, payload] as const;
    })
  );

  return Object.fromEntries(entries) as ImportFilesInput;
}
