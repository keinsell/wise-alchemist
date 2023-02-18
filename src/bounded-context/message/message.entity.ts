import { Message } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";
import { MessageGeneratedEvent } from "./events/message-generated.event.js";
import { GlobalEventBus } from "../../infrastructure/event-bus/memory.event-bus.infra.js";

export class MessageEntity extends Entity<Message> {
  private eventbus = GlobalEventBus;
  get id(): any {
    return this.properties.id;
  }

  get content(): string {
    return this.properties.content;
  }

  get tokensUsed(): number {
    return this.properties.tokensCount;
  }

  get promptId(): number {
    return this.properties.promptId;
  }

  get channelId(): any {
    return this.properties.channelId;
  }

  generated() {
    const event = new MessageGeneratedEvent({
      messageId: this.properties.id,
      tokensUsed: this.properties.tokensCount,
      content: this.properties.content,
    });

    this.eventbus.publish(event);
  }

  static fromSnapshot(snapshot: Message) {
    return new MessageEntity(snapshot);
  }
}
