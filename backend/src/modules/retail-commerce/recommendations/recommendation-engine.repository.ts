import { Prisma, RecommendationDecisionAction, RecommendationStatus, RecommendationType } from "@prisma/client";
import { prisma } from "../../../prisma/client";
import { RecommendationCandidate, RecommendationDecisionInput } from "./recommendation-engine.types";

export const runInTransaction = <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(callback, { maxWait: 20_000, timeout: 120_000 });

export const findInventorySignals = (organizationId: string) =>
  prisma.retailInventory.findMany({
    where: { organizationId },
    include: {
      product: true,
      store: true,
    },
  });

export const findVelocitySummaries = (
  organizationId: string,
  start: Date,
  end: Date
) =>
  prisma.productSalesVelocitySummary.findMany({
    where: {
      organizationId,
      summaryDate: { gte: start, lte: end },
    },
  });

export const createRecommendations = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  candidates: RecommendationCandidate[]
) =>
  Promise.all(
    candidates.map((candidate) =>
      tx.recommendation.create({
        data: {
          organizationId,
          type: candidate.type,
          status: "OPEN",
          productId: candidate.productId,
          sourceStoreId: candidate.sourceStoreId,
          destinationStoreId: candidate.destinationStoreId,
          quantity: candidate.quantity,
          confidenceScore: candidate.confidenceScore,
          reason: candidate.reason,
          signals: candidate.signals,
          expectedImpact: candidate.expectedImpact,
          expiresAt: candidate.expiresAt,
        },
      })
    )
  );

export const expireOpenRecommendations = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  generatedBefore: Date
) =>
  tx.recommendation.updateMany({
    where: {
      organizationId,
      status: "OPEN",
      generatedAt: { lt: generatedBefore },
    },
    data: {
      status: "EXPIRED",
      decidedAt: new Date(),
    },
  });

export const findRecommendations = (
  organizationId: string,
  filters: {
    status?: RecommendationStatus;
    type?: RecommendationType;
    productId?: string;
    storeId?: string;
  }
) =>
  prisma.recommendation.findMany({
    where: {
      organizationId,
      status: filters.status,
      type: filters.type,
      productId: filters.productId,
      OR: filters.storeId
        ? [{ sourceStoreId: filters.storeId }, { destinationStoreId: filters.storeId }]
        : undefined,
    },
    include: {
      product: true,
      sourceStore: true,
      destinationStore: true,
      decisionLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ status: "asc" }, { confidenceScore: "desc" }, { generatedAt: "desc" }],
  });

export const findRecommendationById = (organizationId: string, id: string) =>
  prisma.recommendation.findFirst({
    where: { id, organizationId },
    include: {
      product: true,
      sourceStore: true,
      destinationStore: true,
      decisionLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

export const updateRecommendationDecision = (
  tx: Prisma.TransactionClient,
  organizationId: string,
  recommendationId: string,
  input: RecommendationDecisionInput
) => {
  const statusByAction: Partial<Record<RecommendationDecisionAction, RecommendationStatus>> = {
    ACCEPT: "ACCEPTED",
    REJECT: "REJECTED",
    COMPLETE: "COMPLETED",
    EXPIRE: "EXPIRED",
  };
  const status = statusByAction[input.action];

  return Promise.all([
    status
      ? tx.recommendation.updateMany({
          where: { id: recommendationId, organizationId },
          data: {
            status,
            decidedAt: new Date(),
            outcome: input.metadata,
          },
        })
      : Promise.resolve(null),
    tx.recommendationDecisionLog.create({
      data: {
        recommendationId,
        organizationId,
        action: input.action,
        note: input.note,
        metadata: input.metadata,
        decidedByUserId: input.decidedByUserId,
      },
    }),
  ]);
};
