import { ConversationEntity } from "../../conversation/conversation.entity.js";
import { MessageEntity } from "../../thread/message.entity.js";

export abstract class ArtifictialIntelligenceProvider<OPTIONS> {
  abstract prompt(
    prompt: string,
    conversation: ConversationEntity,
    options?: OPTIONS
  ): Promise<MessageEntity>;
}
