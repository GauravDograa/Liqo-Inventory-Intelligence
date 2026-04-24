import { generateTransferRecommendations } from "./recommendation.service";

const RECOMMENDATION_CACHE_TTL_MS = 1000 * 60 * 5;

type RecommendationData = Awaited<
  ReturnType<typeof generateTransferRecommendations>
>;

type RecommendationCacheEntry = {
  expiresAt: number;
  data?: RecommendationData;
  promise?: Promise<RecommendationData>;
};

const recommendationCache = new Map<string, RecommendationCacheEntry>();

const buildRecommendations = async (organizationId: string) => {
  return generateTransferRecommendations(organizationId);
};

export const getCachedRecommendations = async (
  organizationId: string
): Promise<RecommendationData> => {
  const cachedEntry = recommendationCache.get(organizationId);
  const isFresh =
    cachedEntry?.data && cachedEntry.expiresAt > Date.now();

  if (isFresh && cachedEntry.data) {
    return cachedEntry.data;
  }

  if (cachedEntry?.promise) {
    return cachedEntry.promise;
  }

  const promise = buildRecommendations(organizationId);

  recommendationCache.set(organizationId, {
    ...cachedEntry,
    promise,
  });

  try {
    const data = await promise;
    recommendationCache.set(organizationId, {
      data,
      expiresAt: Date.now() + RECOMMENDATION_CACHE_TTL_MS,
    });
    return data;
  } catch (error) {
    if (cachedEntry?.data) {
      recommendationCache.set(organizationId, cachedEntry);
    } else {
      recommendationCache.delete(organizationId);
    }
    throw error;
  }
};

export const warmRecommendationsCache = async (
  organizationId: string
) => {
  try {
    await getCachedRecommendations(organizationId);
  } catch (error) {
    console.error("Failed to warm recommendation cache:", error);
  }
};
