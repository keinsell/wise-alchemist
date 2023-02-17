import { Conversation } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";

export class ConversationEntity extends Entity<Conversation> {
  static fromPrisma(prismaConversation: Conversation): ConversationEntity {
    return new ConversationEntity(prismaConversation);
  }

  toPrisma(): Conversation {
    return this.properties;
  }
}
