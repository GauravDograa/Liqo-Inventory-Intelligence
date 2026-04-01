import { api } from "@/lib/axios";
import {
  MlForecastHistoryResponse,
  MlForecastOpsStatus,
  MlForecastSelectionResponse,
} from "@/types/mlForecast.types";

export const getMlForecastOpsStatus =
  async (): Promise<MlForecastOpsStatus> => {
    const [selectionResponse, historyResponse] = await Promise.all([
      api.get<MlForecastSelectionResponse>("/ml-forecast/selection"),
      api.get<MlForecastHistoryResponse>("/ml-forecast/history"),
    ]);

    if (!selectionResponse.data.success || !historyResponse.data.success) {
      throw new Error("Failed to fetch ML forecast status");
    }

    return {
      selection: selectionResponse.data.data,
      history: historyResponse.data.data,
    };
  };
