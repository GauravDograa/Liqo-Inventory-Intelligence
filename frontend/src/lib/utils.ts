import { DeadstockItem } from "@/types/deadstock.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateRiskScore = (item: DeadstockItem): number => {
  const ageFactor = Math.min(item.stockAgeDays / 180, 1) * 60;
  const valueFactor = Math.min(item.deadStockValue / 100000, 1) * 40;

  return Math.round(ageFactor + valueFactor);
};

export const getRiskLevel = (score: number) => {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};
