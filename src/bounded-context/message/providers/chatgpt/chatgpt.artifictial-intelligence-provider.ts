import { encode } from "gpt-3-encoder";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.infra.js";
import { generateUUID } from "../../../../utils/uuid.js";
import { ConversationEntity } from "../../../conversation/conversation.entity.js";
import { PromptEntity } from "../../../prompt/prompt.entity.js";
import { ArtifictialIntelligenceProvider } from "../artifictial-intelligence.provider.js";
import { ChatgptModel } from "./types/chatgpt.model.js";
import { ChatgptMessage, ChatgptResponse } from "./types/chatgpt.response.js";
import { InvalidChatgptResponse } from "./errors/invalid-chatgpt-response.error.js";
import { MessageGeneratedEvent } from "../../events/message-generated.event.js";
import { MessageEntity } from "../../message.entity.js";
import signale from "signale";
import { injectable } from "tsyringe";

export interface ChatgptOptions {
  conversationId?: string;
  parentMessageId?: string;
  model?: ChatgptModel;
}

@injectable()
export class ChatgptArtifictialIntelligenceProvider
  implements ArtifictialIntelligenceProvider<ChatgptOptions>
{
  private readonly authorizationHeader: string;
  private readonly cookies: string;
  constructor(private readonly prismaService: PrismaService) {
    if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
      signale.fatal("Could not find CHATGPT_* environment variables.");
      process.exit(1);
    }

    this.authorizationHeader = process.env.CHATGPT_AUTH_TOKEN;
    this.cookies = process.env.CHATGPT_COOKIES;
  }

  async prompt(
    prompt: PromptEntity,
    options?: ChatgptOptions | undefined
  ): Promise<MessageEntity> {
    // Extract options
    let { conversationId, parentMessageId, model } = options || {};

    const message = prompt.content;

    // If parntMessageId is missing generate a new one with uuid
    if (!parentMessageId) {
      parentMessageId = generateUUID();
    }

    let response: Response | undefined;

    // ChatGPT is a little bit tricky.
    await prompt.setGeneratingState();

    signale.info(`Running generation for ${prompt.id}...`);

    try {
      response = await fetch(
        `https://chat.openai.com/backend-api/conversation`,
        {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            Authorization: this.authorizationHeader,
            Cookie: this.cookies,
          }),
          body: JSON.stringify({
            action: "next",
            messages: [
              {
                id: generateUUID(),
                role: "user",
                content: {
                  content_type: "text",
                  parts: [message],
                },
              },
            ],
            parent_message_id: parentMessageId,
            model: model || ChatgptModel.turbo,
            conversation_id: conversationId,
          }),
        }
      );
    } catch (error) {
      prompt.setFailedState();
      throw new InvalidChatgptResponse(JSON.stringify(error));
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const result: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      result.push(chunk);
    }

    if (result.length == 1) {
      const parsed = JSON.parse(result[0]) as { detail: string };
      prompt.setFailedState();
      throw new InvalidChatgptResponse(parsed.detail);
    }

    const final = result[result.length - 2];
    const index = final.indexOf("data:");
    const jsonString = final.substring(index + 6);

    const parsedResponse = JSON.parse(jsonString) as ChatgptResponse;
    const plainContent = parsedResponse.message.content.parts.join();
    const tokensUsed = encode(plainContent).length;

    // Construct entities from the response.
    const savedGeneration = await this.prismaService.message.create({
      data: {
        id: parsedResponse.message.id,
        content: plainContent,
        tokensCount: tokensUsed,
        channelId: prompt.channelId,
        prompt: {
          connect: {
            id: prompt.id,
          },
        },
        Conversation: {
          connectOrCreate: {
            where: {
              id: parsedResponse.conversation_id,
            },
            create: {
              id: parsedResponse.conversation_id,
              channelId: prompt.channelId,
            },
          },
        },
      },
    });

    const messageEntity = MessageEntity.fromSnapshot(savedGeneration);
    await prompt.setCompletedState();
    await messageEntity.generated();
    return messageEntity;
  }
}
