import { api } from "@/lib/axios";
import {
  DeadstockItem,
  DeadstockResponse,
} from "@/types/deadstock.types";

export const getDeadstock = async (): Promise<DeadstockItem[]> => {
  const { data } = await api.get<DeadstockResponse>(
    "deadstock/summary"
  );

  if (!data.success) {
    throw new Error("Failed to fetch deadstock data");
  }

  return data.data ?? []; // 👈 unwrap here
};