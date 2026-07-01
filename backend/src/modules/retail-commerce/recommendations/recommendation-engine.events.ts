import { eventBus } from "../../../infrastructure/events";
import { logger } from "../../../infrastructure/logger";
import * as service from "./recommendation-engine.service";

type RecommendationTriggerPayload = {
  organizationId: string;
};

let registered = false;

export const registerRecommendationEventHandlers = () => {
  if (registered) {
    return;
  }

  for (const eventName of [
    "retail.transaction.completed",
    "retail.inventory.low_stock_detected",
  ]) {
    eventBus.subscribe<RecommendationTriggerPayload>(eventName, async (event) => {
      await service.generateRecommendations(event.payload.organizationId);
    });
  }

  registered = true;
  logger.info("Retail recommendation event handlers registered");
};
