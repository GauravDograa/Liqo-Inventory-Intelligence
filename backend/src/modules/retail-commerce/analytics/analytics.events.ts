import { eventBus } from "../../../infrastructure/events";
import { logger } from "../../../infrastructure/logger";
import * as service from "./analytics.service";

type TransactionCompletedPayload = {
  organizationId: string;
  transactionId: string;
};

type InventoryChangedPayload = {
  organizationId: string;
};

let registered = false;

export const registerAnalyticsEventHandlers = () => {
  if (registered) {
    return;
  }

  eventBus.subscribe<TransactionCompletedPayload>(
    "retail.transaction.completed",
    async (event) => {
      await service.syncOperationalAnalyticsForTransaction(
        event.payload.organizationId,
        event.payload.transactionId
      );
    }
  );

  for (const eventName of [
    "retail.inventory.deducted",
    "retail.inventory.adjusted",
    "retail.inventory.low_stock_detected",
  ]) {
    eventBus.subscribe<InventoryChangedPayload>(eventName, async (event) => {
      await service.syncOperationalAnalyticsForDate(event.payload.organizationId);
    });
  }

  registered = true;
  logger.info("Retail analytics event handlers registered");
};
