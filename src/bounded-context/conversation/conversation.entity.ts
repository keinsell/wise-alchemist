import { Conversation } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";
import { GlobalEventBus } from "../../infrastructure/event-bus/memory.event-bus.infra.js";

export class ConversationEntity extends Entity<Conversation> {
  private eventbus = GlobalEventBus;
  openConversation() {}
  closeConversation() {}
  static fromSnapshot(prop: Conversation): ConversationEntity {
    return new ConversationEntity(prop);
  }
}
