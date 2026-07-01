import { RecommendationDecisionAction, RecommendationStatus, RecommendationType } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./recommendation-engine.repository";
import { buildRecommendationCandidates } from "./recommendation-rules.util";
import { InventorySignal, RecommendationDecisionInput, VelocitySignal } from "./recommendation-engine.types";

const historyWindowDays = 30;

const getHistoryWindow = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - historyWindowDays);
  return { start, end };
};

const velocityKey = (productId: string, storeId: string) => `${productId}:${storeId}`;

const buildVelocityMap = (summaries: Awaited<ReturnType<typeof repo.findVelocitySummaries>>) => {
  const map = new Map<string, VelocitySignal>();

  for (const summary of summaries) {
    if (!summary.storeId) {
      continue;
    }

    const key = velocityKey(summary.productId, summary.storeId);
    const existing = map.get(key) ?? {
      productId: summary.productId,
      storeId: summary.storeId,
      unitsSold: 0,
      revenue: summary.revenue,
      transactionCount: 0,
      velocityPerDay: 0,
    };

    map.set(key, {
      productId: summary.productId,
      storeId: summary.storeId,
      unitsSold: existing.unitsSold + summary.unitsSold,
      revenue: existing.revenue.plus(summary.revenue),
      transactionCount: existing.transactionCount + summary.transactionCount,
      velocityPerDay: Number(((existing.unitsSold + summary.unitsSold) / historyWindowDays).toFixed(2)),
    });
  }

  return map;
};

export const generateRecommendations = async (organizationId: string) => {
  const { start, end } = getHistoryWindow();
  const [inventory, velocitySummaries] = await Promise.all([
    repo.findInventorySignals(organizationId),
    repo.findVelocitySummaries(organizationId, start, end),
  ]);
  const velocityMap = buildVelocityMap(velocitySummaries);

  const signals: InventorySignal[] = inventory.map((item) => {
    const velocity = velocityMap.get(velocityKey(item.productId, item.storeId));

    return {
      inventoryId: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSku: item.product.sku,
      storeId: item.storeId,
      storeName: item.store.name,
      quantityAvailable: item.quantityAvailable,
      quantityOnHand: item.quantityOnHand,
      reorderLevel: item.reorderLevel,
      reorderQuantity: item.reorderQuantity,
      velocityPerDay: velocity?.velocityPerDay ?? 0,
    };
  });

  const candidates = buildRecommendationCandidates(signals);
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 6);

  const created = await repo.runInTransaction(async (tx) => {
    await repo.expireOpenRecommendations(tx, organizationId, cutoff);
    return repo.createRecommendations(tx, organizationId, candidates.slice(0, 100));
  });

  return {
    generatedCount: created.length,
    candidatesEvaluated: candidates.length,
    historyWindowDays,
    recommendations: created,
  };
};

export const listRecommendations = (
  organizationId: string,
  filters: {
    status?: string;
    type?: string;
    productId?: string;
    storeId?: string;
  }
) => {
  const status = filters.status as RecommendationStatus | undefined;
  const type = filters.type as RecommendationType | undefined;

  return repo.findRecommendations(organizationId, {
    status,
    type,
    productId: filters.productId,
    storeId: filters.storeId,
  });
};

export const getRecommendation = async (organizationId: string, id: string) => {
  const recommendation = await repo.findRecommendationById(organizationId, id);

  if (!recommendation) {
    throw new NotFoundError("Recommendation not found");
  }

  return recommendation;
};

const parseAction = (value: unknown): RecommendationDecisionAction => {
  if (typeof value !== "string") {
    throw new BadRequestError("action is required");
  }

  if (!["ACCEPT", "REJECT", "COMPLETE", "EXPIRE", "NOTE"].includes(value)) {
    throw new BadRequestError("action is invalid");
  }

  return value as RecommendationDecisionAction;
};

export const recordDecision = async (
  organizationId: string,
  recommendationId: string,
  input: {
    action: unknown;
    note?: unknown;
    decidedByUserId?: unknown;
    metadata?: unknown;
  }
) => {
  await getRecommendation(organizationId, recommendationId);

  const decision: RecommendationDecisionInput = {
    action: parseAction(input.action),
    note: typeof input.note === "string" ? input.note : undefined,
    decidedByUserId: typeof input.decidedByUserId === "string" ? input.decidedByUserId : undefined,
    metadata: input.metadata && typeof input.metadata === "object" ? input.metadata as any : undefined,
  };

  await repo.runInTransaction(async (tx) => {
    await repo.updateRecommendationDecision(tx, organizationId, recommendationId, decision);
  });

  return getRecommendation(organizationId, recommendationId);
};
