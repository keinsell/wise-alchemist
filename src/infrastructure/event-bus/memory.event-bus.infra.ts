import { EventHandler } from "../../shared/domain/events/event-handler.shared.js";
import { EventPublisher } from "../../shared/domain/events/event-publisher.shared.js";
import { EventSubscriber } from "../../shared/domain/events/event-subscriber.shared.js";
import { injectable } from "tsyringe";

@injectable()
export class InMemoryEventBus
  implements EventPublisher<any>, EventSubscriber<any>
{
  private handlers: { [key: string]: Array<EventHandler<any>> } = {};

  subscribe(eventType: string, handler: EventHandler<any>): void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }
  unsubscribe(eventType: string, handler: EventHandler<any>): void {
    if (!this.handlers[eventType]) {
      return;
    }
    const index = this.handlers[eventType].indexOf(handler);
    if (index !== -1) {
      this.handlers[eventType].splice(index, 1);
    }
  }
  async publish(event: any): Promise<void> {
    const eventType = (event as any).type;
    if (!this.handlers[eventType]) {
      return;
    }
    this.handlers[eventType].forEach((handler) => {
      handler.handle(event);
    });
  }
}

export const GlobalEventBus = new InMemoryEventBus();
