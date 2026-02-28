import { DeadstockItem } from "@/types/deadstock.types";

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