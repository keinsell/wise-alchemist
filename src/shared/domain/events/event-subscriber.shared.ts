import { DomainEvent } from "./domain-event.shared.js";
import { EventHandler } from "./event-handler.shared.js";

export interface EventSubscriber<T> {
  subscribe(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler<T>): void;
}
