import { PromptEntity } from "../../prompt/prompt.entity.js";
import { MessageEntity } from "../message.entity.js";

export abstract class ArtifictialIntelligenceProvider<OPTIONS> {
  abstract prompt(
    prompt: PromptEntity,
    options?: OPTIONS
  ): Promise<MessageEntity>;
}
