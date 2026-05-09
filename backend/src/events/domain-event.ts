export type DomainEvent<TPayload = unknown> = {
  id: string;
  name: string;
  occurredAt: Date;
  aggregateId?: string;
  correlationId?: string;
  payload: TPayload;
};

export type DomainEventHandler<TPayload = unknown> = (
  event: DomainEvent<TPayload>
) => Promise<void> | void;
