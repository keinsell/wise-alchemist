import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import {
  LargeLanguageModelOptions,
  LargeLanguageModelProvider,
} from '../../../adapters/providers/content-generation/large-language-model.provider';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@prisma/client';
import { ChatgptModel } from './chatgpt.model';
import { randomUUID } from 'node:crypto';
import { ChatgptResponse } from './chatgpt.response';
import { encode } from 'gpt-3-encoder';
import { ConversationService } from 'src/boundary-context/conversation/conversation.service';
import { MessageService } from 'src/boundary-context/message/message.service';

export interface ChatgptLargeLanguageModelOptions
  extends LargeLanguageModelOptions {
  model: ChatgptModel;
}

@Injectable()
export class ChatgptLargeLanguageModelService
  implements LargeLanguageModelProvider<ChatgptLargeLanguageModelOptions>
{
  private logger = new Logger(ChatgptLargeLanguageModelService.name);
  private readonly authorizationHeader: string;
  private readonly cookies: string;
  constructor(private readonly prismaService: PrismaService) {
    if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
      this.logger.error('Could not find CHATGPT_* environment variables.');
      process.exit(1);
    }

    this.authorizationHeader = process.env.CHATGPT_AUTH_TOKEN;
    this.cookies = process.env.CHATGPT_COOKIES;
  }

  async promptMessage(
    message: string,
    options?: ChatgptLargeLanguageModelOptions,
  ): Promise<Message> {
    // Extract core information from options
    let model = options?.model;
    let messageId = randomUUID();

    let parentMessageId = await this.getParentMessageIdFromOptions(options);
    let conversationId = await this.getConversationIdFromOptions(options);

    // If model is missing default to turbo
    if (!model) {
      model = ChatgptModel.turbo;
    }

    // Send a "STARTED_GENERATION" event
    this.logger.log(`Running generation for ${messageId}...`);

    // Send request to https://chat.openai.com/backend-api/conversation

    let response: any;

    try {
      response = await fetch(
        `https://chat.openai.com/backend-api/conversation`,
        {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: this.authorizationHeader,
            Cookie: this.cookies,
          }),
          body: JSON.stringify({
            action: 'next',
            messages: [
              {
                id: randomUUID(),
                role: 'user',
                content: {
                  content_type: 'text',
                  parts: [message],
                },
              },
            ],
            parent_message_id: parentMessageId,
            model: model || ChatgptModel.turbo,
            conversation_id: conversationId,
          }),
        },
      );
    } catch (e) {
      console.log(e);
      return;
    }

    // Parse chatgpt response as json
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
      console.log(parsed);

      const tooManyRequestsErrorMessage =
        'Only one message at a time. Please allow any other responses to complete before sending another message, or wait one minute.';
      const wrongConversationIdOrParentId =
        'Something went wrong, please try reloading the conversation.';

      //   prompt.setFailedState();
      //   throw new InvalidChatgptResponse(parsed.detail);
    }

    const final = result[result.length - 2];
    const index = final.indexOf('data:');
    const jsonString = final.substring(index + 6);

    const parsedResponse = JSON.parse(jsonString) as ChatgptResponse;
    const plainContent = parsedResponse.message.content.parts.join();
    const tokens = encode(plainContent);

    // Attach externalId to conversation if do not have any
    if (!conversationId) {
      conversationId = parsedResponse.conversation_id;

      await this.prismaService.conversation.update({
        where: {
          id: options?.conversation.id,
        },
        data: {
          external_id: conversationId,
        },
      });
    }

    // Find parent message which was used for generation
    const parentMessage = await this.prismaService.message.findFirst({
      where: {
        conversation_id: options?.conversation.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // If parentMessage exist make it a reference for generation
    if (parentMessage) {
      this.logger.log(
        `Reference found for ${messageId}: Parent message is ${parentMessage.id}`,
      );

      this.prismaService.message.update({
        where: {
          id: parentMessage.id,
        },
        data: {
          external_id: parentMessageId,
        },
      });
    }

    // Create a new message with generation content

    const generatedMessage = await this.prismaService.message.create({
      data: {
        external_id: messageId,
        content: plainContent,
        author: 'SYSTEM',
        conversation: {
          connect: {
            external_id: conversationId,
          },
        },
        tokenCount: tokens.length,
        tokens: tokens,
      },
    });

    console.log(generatedMessage);
  }

  public async getParentMessageIdFromOptions(
    options?: ChatgptLargeLanguageModelOptions,
  ): Promise<string> {
    let parentMessageId = undefined;

    // Check for provided conversation.
    if (options?.conversation) {
      // Fetch all messages in conversation and find latest message generated by system.
      const message = await this.prismaService.message.findFirst({
        select: { external_id: true },
        where: {
          conversation_id: options.conversation.id,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // If message was found, extract message externalId
      if (message) parentMessageId = message.external_id;
    }

    // If no parentMessageId was found, generate an unique Id with uuid.
    if (!parentMessageId) parentMessageId = randomUUID();

    return parentMessageId;
  }

  public async getConversationIdFromOptions(
    options?: ChatgptLargeLanguageModelOptions,
  ): Promise<string | undefined> {
    let conversationId = undefined;

    if (options?.conversation) {
      const conversation = await this.prismaService.conversation.findFirst({
        select: { external_id: true },
        where: {
          id: options.conversation.id,
        },
      });

      if (conversation) {
        conversationId = conversation.external_id;
      }
    }

    return conversationId;
  }
}
