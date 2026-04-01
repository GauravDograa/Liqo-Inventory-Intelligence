export interface MlForecastSelection {
  winner: string;
  selectedAt?: string;
  selectionMetric?: string;
  strategy?: string;
  supportedModels: string[];
  scores: Record<string, number | null>;
  timeBasedScores: Record<string, number | null>;
}

export interface MlForecastHistoryEntry {
  selectedAt: string;
  winner: string;
  selectionMetric: string;
  dataset: {
    totalRows: number;
    trainRows: number;
    testRows: number;
    historyWindowDays: number;
    horizonDays: number;
  };
  scores: Record<string, number | null>;
  timeBasedScores: Record<string, number | null>;
  improvement: Record<string, number | null>;
  modelNames: Record<string, string | null>;
}

export interface MlForecastSelectionResponse {
  success: boolean;
  data: MlForecastSelection;
}

export interface MlForecastHistoryResponse {
  success: boolean;
  data: MlForecastHistoryEntry[];
}

export interface MlForecastOpsStatus {
  selection: MlForecastSelection;
  history: MlForecastHistoryEntry[];
}
