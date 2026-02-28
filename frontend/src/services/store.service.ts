import { api } from "@/lib/axios";
import {
  StorePerformanceItem,
  StorePerformanceResponse,
} from "@/types/store.types";

export const getStorePerformance =
  async (): Promise<StorePerformanceItem[]> => {
    const { data } =
      await api.get<StorePerformanceResponse>(
        "stores/performance"
      );

    if (!data.success) {
      throw new Error("Failed to fetch store performance");
    }

    return data.data ?? [];
  };