import { Conversation } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";

export class ConversationEntity extends Entity<Conversation> {
  get id(): any {
    return this.properties.id;
  }
  static fromSnapshot(prop: Conversation): ConversationEntity {
    return new ConversationEntity(prop);
  }
}
