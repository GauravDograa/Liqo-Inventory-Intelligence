import { api } from "@/lib/axios";
import { InventoryItem } from "@/types/inventory.types";

export const getInventory = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get("/inventory");

  if (!data.success) {
    throw new Error("Failed to fetch inventory");
  }

  return data.data;
};