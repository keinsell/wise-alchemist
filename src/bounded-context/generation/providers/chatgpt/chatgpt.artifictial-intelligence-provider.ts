import { ConversationEntity } from "../../../conversation/conversation.entity.js";
import { MessageEntity } from "../../../thread/message.entity.js";
import { ArtifictialIntelligenceProvider } from "../artifictial-intelligence.provider.js";

export class ChatgptArtifictialIntelligenceProvider extends ArtifictialIntelligenceProvider<{}> {
  prompt(
    prompt: string,
    conversation: ConversationEntity,
    options?: {} | undefined
  ): Promise<MessageEntity> {
    throw new Error("Method not implemented.");
  }
}
