import { DomainEvent } from "./domain-event.shared.js";

export abstract class EventHandler<T> {
  abstract handle(event: T): Promise<void>;
}
