import { Message } from "@prisma/client";
import { LlmService } from "../module.llm/llm.service.js";
import { encode } from "gpt-3-encoder";
import { prisma } from "../infrastructure/prisma.infra.js";
import signale from "signale";
import { ChatGPTResponse } from "../utils/scrapper.js";
import { PrismaService } from "../infrastructure/prisma/prisma.infra.js";
import { inject, injectable } from "tsyringe";

@injectable()
export class MessageService {
  private llm = new LlmService();
  async send(properties: {
    discord_UserId: string;
    discord_MessageId: string;
    discord_ChannelId: string;
    prompt: string;
    parentMessageId?: string;
    conversationId?: string;
  }): Promise<Message | undefined> {
    let response: ChatGPTResponse | undefined;

    // Send the message to the conversation
    try {
      response = await this.llm.sendPrompt(
        properties.prompt,
        properties.parentMessageId,
        properties.conversationId
      );
    } catch (error) {
      signale.error(error);
    }

    if (!response) {
      return undefined;
    }

    // Extract generated content to string
    const raw_string = response.message.content.parts[0];
    const tokens_used = encode(raw_string).length;
    const model = response.message.metadata.model_slug;
    const conversationId = response.conversation_id;
    const messageId = response.message.id;

    // Save message
    const message = await prisma.message.create({
      data: {
        id: messageId,
        parentMessageId: properties.parentMessageId,
        discordUserId: properties.discord_UserId,
        discordMessageId: properties.discord_MessageId,
        input: properties.prompt,
        output: raw_string,
        tokensUsed: tokens_used,
        model,
        conversation: {
          connectOrCreate: {
            create: {
              id: conversationId,
              channelId: properties.discord_ChannelId,
              isClosed: false,
            },
            where: {
              id: conversationId,
            },
          },
        },
      },
    });

    signale.success(
      `Generated message: ${message.id}. Used ${tokens_used} tokens.`
    );

    return message;
  }

  async linkBotMessageToMessage(
    message: Message,
    idOfMessageSent: string
  ): Promise<Message> {
    return await prisma.message.update({
      where: { id: message.id },
      data: { discordBotMessageIds: { push: idOfMessageSent } },
    });
  }
}
