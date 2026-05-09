import { EventBus } from "../../events/event-bus";
import { DomainEvent, DomainEventHandler } from "../../events/domain-event";
import { logger } from "../logger";

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    const handlers = this.handlers.get(event.name) || [];

    logger.debug("Publishing domain event", {
      eventName: event.name,
      eventId: event.id,
      handlerCount: handlers.length,
    });

    await Promise.all(handlers.map((handler) => handler(event)));
  }

  subscribe<TPayload>(
    eventName: string,
    handler: DomainEventHandler<TPayload>
  ): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler as DomainEventHandler);
    this.handlers.set(eventName, handlers);
  }
}
