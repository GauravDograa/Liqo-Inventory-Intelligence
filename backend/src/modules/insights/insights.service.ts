import OpenAI from "openai";
import * as dashboardService from "../dashboard/dashboard.service";
import * as storeService from "../storePerformance/storePerformance.service";
import * as categoryService from "../category/category.service";
import * as deadstockService from "../deadstock/deadstock.service";
import * as recommendationService from "../recommendation/recommendation.service";

export interface AiInsightsSummary {
  summary: string;
  risks: string[];
  actions: string[];
  followUpQuestions: string[];
  source: "openai" | "fallback";
}

export interface AiInsightsAnswer {
  answer: string;
  source: "openai" | "fallback";
}

export const generateOverviewInsights = async (
  organizationId: string,
  start?: string,
  end?: string
) => {
  const dashboard = await dashboardService.getDashboardOverview(start, end);
  const stores = await storeService.getPerformance(organizationId);
  const categories = await categoryService.getCategoryPerformance(start, end);
  const deadstock = await deadstockService.getDeadStockSummary(
    organizationId,
    90
  );

  const safeStores = Array.isArray(stores) ? [...stores] : [];
  const safeCategories = Array.isArray(categories) ? [...categories] : [];
  const safeDeadstock = Array.isArray(deadstock) ? deadstock : [];

  const sortedStoresDesc = [...safeStores].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  const sortedStoresAsc = [...safeStores].sort(
    (a, b) => a.totalRevenue - b.totalRevenue
  );

  const topStore = sortedStoresDesc[0] || null;
  const worstStore = sortedStoresAsc[0] || null;

  const sortedCategories = [...safeCategories].sort(
    (a, b) => b.grossMargin - a.grossMargin
  );

  const highestMarginCategory = sortedCategories[0] || null;

  const deadStockValue = safeDeadstock.reduce(
    (sum, d) => sum + (d.deadStockValue || 0),
    0
  );

  const totalRevenue = dashboard?.totalRevenue || 0;

  const deadStockRisk =
    deadStockValue > totalRevenue * 0.2
      ? "High"
      : deadStockValue > totalRevenue * 0.1
      ? "Medium"
      : "Low";

  return {
    totalRevenue,
    grossMargin: dashboard?.grossMargin || 0,
    topPerformer: topStore?.storeName || null,
    worstPerformer: worstStore?.storeName || null,
    highestMarginCategory: highestMarginCategory?.category || null,
    deadStockValue,
    deadstockRisk: deadStockRisk
  };
};

export const generateAiInsightsSummary = async (
  organizationId: string,
  start?: string,
  end?: string
): Promise<AiInsightsSummary> => {
  const context = await buildInsightsContext(organizationId, start, end);

  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackInsightsSummary(context);
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an executive retail inventory analyst. Respond as JSON with keys: summary, risks, actions, followUpQuestions. Each risk/action/question should be a short sentence. Base every statement only on the provided analytics context.",
        },
        {
          role: "user",
          content: `Create an executive summary for this retail inventory platform data:\n${JSON.stringify(
            context
          )}`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return buildFallbackInsightsSummary(context);
    }

    const parsed = JSON.parse(content) as Partial<AiInsightsSummary>;

    return {
      summary:
        parsed.summary ||
        "Performance is stable, but retail operations should review the highlighted risks and actions.",
      risks: sanitizeStringArray(parsed.risks, 3),
      actions: sanitizeStringArray(parsed.actions, 3),
      followUpQuestions: sanitizeStringArray(parsed.followUpQuestions, 3),
      source: "openai",
    };
  } catch (error) {
    console.error("AI insights generation failed:", error);
    return buildFallbackInsightsSummary(context);
  }
};

export const answerAiInsightsQuestion = async (
  organizationId: string,
  question: string,
  start?: string,
  end?: string
): Promise<AiInsightsAnswer> => {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    throw Object.assign(new Error("Question is required"), {
      statusCode: 400,
    });
  }

  const context = await buildInsightsContext(organizationId, start, end);

  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackInsightsAnswer(trimmedQuestion, context);
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an executive retail inventory analyst. Answer the user's question using only the provided analytics context. Keep the answer concise, practical, and business-focused.",
        },
        {
          role: "user",
          content: `Analytics context:\n${JSON.stringify(
            context
          )}\n\nQuestion: ${trimmedQuestion}`,
        },
      ],
      temperature: 0.3,
    });

    const answer = completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      return buildFallbackInsightsAnswer(trimmedQuestion, context);
    }

    return {
      answer,
      source: "openai",
    };
  } catch (error) {
    console.error("AI insights Q&A failed:", error);
    return buildFallbackInsightsAnswer(trimmedQuestion, context);
  }
};

async function buildInsightsContext(
  organizationId: string,
  start?: string,
  end?: string
) {
  const overview = await generateOverviewInsights(organizationId, start, end);
  const stores = await storeService.getPerformance(organizationId);
  const categories = await categoryService.getCategoryPerformance(start, end);
  const deadstock = await deadstockService.getDeadStockSummary(
    organizationId,
    90
  );
  const recommendations =
    await recommendationService.generateTransferRecommendations(organizationId);

  return {
    overview,
    topStores: [...stores]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3)
      .map((store) => ({
        storeName: store.storeName,
        totalRevenue: store.totalRevenue,
        grossMargin: store.grossMargin,
      })),
    weakestStores: [...stores]
      .sort((a, b) => a.totalRevenue - b.totalRevenue)
      .slice(0, 3)
      .map((store) => ({
        storeName: store.storeName,
        totalRevenue: store.totalRevenue,
        grossMargin: store.grossMargin,
      })),
    topCategories: [...categories]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3)
      .map((category) => ({
        category: category.category,
        totalRevenue: category.totalRevenue,
        grossMargin: category.grossMargin,
      })),
    deadstockHighlights: deadstock.slice(0, 5).map((item) => ({
      storeName: item.store,
      skuId: item.sku,
      deadStockValue: item.deadStockValue,
      stockAgeDays: item.stockAgeDays,
    })),
    recommendationHighlights: recommendations.slice(0, 5).map((item) => ({
      skuCategory: item.skuCategory,
      moveFrom: item.moveFrom,
      moveTo: item.moveTo,
      quantity: item.quantity,
      demandCoverageDays: item.impact?.demandCoverageDays || 0,
    })),
  };
}

function buildFallbackInsightsSummary(context: any): AiInsightsSummary {
  const topStore = context.topStores[0];
  const weakestStore = context.weakestStores[0];
  const topCategory = context.topCategories[0];
  const firstRecommendation = context.recommendationHighlights[0];

  const summary = [
    `Revenue is currently ${formatCurrency(context.overview.totalRevenue)} with a gross margin of ${context.overview.grossMargin.toFixed(
      1
    )}%.`,
    topStore
      ? `${topStore.storeName} is the strongest revenue contributor right now.`
      : "Store performance is mixed across the network.",
    context.overview.deadstockRisk
      ? `Deadstock risk is ${context.overview.deadstockRisk.toLowerCase()}.`
      : "Deadstock exposure should be reviewed."
  ].join(" ");

  const risks = [
    weakestStore
      ? `${weakestStore.storeName} is the weakest-performing store by revenue and should be reviewed first.`
      : "The weakest store trend should be reviewed.",
    context.overview.deadstockRisk === "High"
      ? "Deadstock value is materially high relative to revenue."
      : "Aging inventory still needs monitoring to prevent deadstock buildup.",
    !context.recommendationHighlights.length
      ? "The transfer engine found limited redistribution opportunities, which may point to flat inventory allocation."
      : "Inter-store imbalances are still creating transfer opportunities."
  ];

  const actions = [
    firstRecommendation
      ? `Prioritize the suggested transfer from ${firstRecommendation.moveFrom} to ${firstRecommendation.moveTo} for ${firstRecommendation.quantity} units.`
      : "Review store-level inventory balances and confirm whether transfer recommendations should be expanded.",
    topCategory
      ? `Protect margin in ${topCategory.category}, which is currently one of the most valuable categories.`
      : "Review category mix to identify the biggest profit contributors.",
    "Investigate transaction files with a proper Quantity column to improve AI and recommendation accuracy."
  ];

  const followUpQuestions = [
    "Which store needs immediate action first?",
    "What is driving deadstock risk right now?",
    "Which transfer recommendation creates the highest impact?"
  ];

  return {
    summary,
    risks,
    actions,
    followUpQuestions,
    source: "fallback",
  };
}

function buildFallbackInsightsAnswer(
  question: string,
  context: any
): AiInsightsAnswer {
  const lowerQuestion = question.toLowerCase();
  const topStore = context.topStores[0];
  const weakestStore = context.weakestStores[0];
  const recommendation = context.recommendationHighlights[0];

  let answer = `Revenue is ${formatCurrency(
    context.overview.totalRevenue
  )}, gross margin is ${context.overview.grossMargin.toFixed(
    1
  )}%, and deadstock risk is ${context.overview.deadstockRisk.toLowerCase()}.`;

  if (lowerQuestion.includes("store") && weakestStore) {
    answer = `${weakestStore.storeName} needs the fastest review because it is currently the weakest store by revenue. ${topStore ? `${topStore.storeName} is leading the network right now.` : ""}`.trim();
  } else if (lowerQuestion.includes("deadstock")) {
    answer = `Deadstock risk is ${context.overview.deadstockRisk.toLowerCase()} with a current deadstock value of ${formatCurrency(
      context.overview.deadStockValue
    )}. Focus first on the oldest inventory rows and stores carrying the highest aging value.`;
  } else if (
    (lowerQuestion.includes("transfer") ||
      lowerQuestion.includes("move") ||
      lowerQuestion.includes("recommend")) &&
    recommendation
  ) {
    answer = `The top transfer to review is moving ${recommendation.quantity} units from ${recommendation.moveFrom} to ${recommendation.moveTo} in ${recommendation.skuCategory}. That move supports about ${recommendation.demandCoverageDays} days of demand coverage.`;
  } else if (lowerQuestion.includes("margin")) {
    answer = `Gross margin is ${context.overview.grossMargin.toFixed(
      1
    )}%. ${context.topCategories[0] ? `${context.topCategories[0].category} is one of the strongest category contributors.` : "Category mix should be reviewed next."}`;
  }

  return {
    answer,
    source: "fallback",
  };
}

function sanitizeStringArray(value: unknown, fallbackCount: number) {
  if (!Array.isArray(value)) {
    return Array.from({ length: fallbackCount }).map((_, index) =>
      index === 0
        ? "Review the latest retail performance trend."
        : index === 1
        ? "Focus on the biggest operational risk."
        : "Decide on the next best action."
    );
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 5);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
