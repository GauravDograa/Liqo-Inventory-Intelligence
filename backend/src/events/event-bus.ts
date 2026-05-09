import { DomainEvent, DomainEventHandler } from "./domain-event";

export interface EventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(
    eventName: string,
    handler: DomainEventHandler<TPayload>
  ): void;
}
