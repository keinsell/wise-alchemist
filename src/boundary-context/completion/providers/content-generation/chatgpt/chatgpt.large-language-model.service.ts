import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { Injectable, Logger } from '@nestjs/common';
import { Completion, Conversation, Message, Prompt } from '@prisma/client';
import { ChatgptModel } from './chatgpt.model';
import { randomUUID } from 'node:crypto';
import { ChatgptResponse } from './chatgpt.response';
import { encode } from 'gpt-3-encoder';
import { ContentGenerationProvider } from 'src/boundary-context/completion/adapters/providers/content-generation/content-generation.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompletionGeneratedEvent } from 'src/boundary-context/completion/events/completion-generated/completion-generated.event';

@Injectable()
export class ChatgptLargeLanguageModelService
  implements ContentGenerationProvider
{
  private logger = new Logger(ChatgptLargeLanguageModelService.name);
  private readonly authorizationHeader: string;
  private readonly cookies: string;
  constructor(
    private readonly prismaService: PrismaService,
    private publisher: EventEmitter2,
  ) {
    if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
      this.logger.error('Could not find CHATGPT_* environment variables.');
      process.exit(1);
    }

    this.authorizationHeader = process.env.CHATGPT_AUTH_TOKEN;
    this.cookies = process.env.CHATGPT_COOKIES;
  }
  async prompt(prompt: Prompt): Promise<Completion> {
    const model = prompt.model as ChatgptModel;
    const promptWithConversationAndMessage =
      await this.prismaService.prompt.findUnique({
        where: {
          id: prompt.id,
        },
        include: {
          message: {
            include: {
              conversation: true,
            },
          },
        },
      });

    let messageId = randomUUID();

    const parentMessageId = await this.getParentMessageIdFromConversation(
      promptWithConversationAndMessage.message.conversation,
    );

    let conversationId = await this.getConversationIdByConversation(
      promptWithConversationAndMessage.message.conversation,
    );

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
                  parts: [prompt.prompt],
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

      throw new Error();
    }

    const final = result[result.length - 2];
    const index = final.indexOf('data:');
    const jsonString = final.substring(index + 6);

    const parsedResponse = JSON.parse(jsonString) as ChatgptResponse;
    const plainContent = parsedResponse.message.content.parts.join();
    const tokens = encode(plainContent);

    conversationId = parsedResponse.conversation_id;
    messageId = parsedResponse.message.id;

    // Save generation in database
    const generation = await this.prismaService.completion.create({
      data: {
        Prompt: {
          connect: {
            id: prompt.id,
          },
        },
        completion: plainContent,
      },
    });

    await this.addExternalidToConversation(
      promptWithConversationAndMessage.message.conversation,
      conversationId,
    );

    await this.updateIdOfParentMessageSendByUser(
      promptWithConversationAndMessage.message,
      parentMessageId,
    );

    await this.prismaService.message.create({
      data: {
        external_id: messageId,
        author: 'SYSTEM',
        content: plainContent,
        tokenCount: tokens.length,
        tokens,
        conversation: {
          connect: {
            id: promptWithConversationAndMessage.message.conversation.id,
          },
        },
      },
    });

    this.publisher.emit(
      'completion.generated',
      new CompletionGeneratedEvent({
        promptCreatedByMessage: promptWithConversationAndMessage.message,
        createdByPrompt: promptWithConversationAndMessage,
        messageFromConversation:
          promptWithConversationAndMessage.message.conversation,
        generationMade: generation,
      }),
    );
  }

  private async getParentMessageIdFromConversation(
    conversation: Conversation,
  ): Promise<string> {
    let parentMessageId = undefined;

    const message = await this.prismaService.message.findFirst({
      where: {
        conversation_id: conversation.id,
        external_id: { not: null },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (message) parentMessageId = message.external_id;

    // If no parentMessageId was found, generate an unique Id with uuid.
    if (!parentMessageId) {
      parentMessageId = randomUUID();

      if (message) {
        await this.prismaService.message.update({
          where: { id: message.id },
          data: { external_id: parentMessageId },
        });
      }
    }

    return parentMessageId;
  }

  private async getConversationIdByConversation(
    conversation: Conversation,
  ): Promise<string | undefined> {
    let conversationId = undefined;

    conversationId = conversation?.external_id ?? undefined;

    return conversationId;
  }

  private async updateIdOfParentMessageSendByUser(
    message: Message,
    parentMessageId: string,
  ): Promise<void> {
    // If Message have attached a external_id and external_id is same as parentMessageId, break function
    if (message?.external_id && message?.external_id === parentMessageId) {
      return;
    }

    const isMessageWithSelectedParentMessageId =
      await this.prismaService.message.findFirst({
        where: {
          external_id: parentMessageId,
        },
      });

    if (isMessageWithSelectedParentMessageId) {
      return;
    }

    await this.prismaService.message.update({
      where: {
        id: message.id,
      },
      data: {
        external_id: parentMessageId,
      },
    });
  }

  private async addExternalidToConversation(
    conversation: Conversation,
    conversationId: string,
  ): Promise<void> {
    await this.prismaService.conversation.update({
      where: { id: conversation!.id },
      data: { external_id: conversationId },
    });
  }

  private async createMessageFromChatgptResponse(
    parsedResponse: ChatgptResponse,
    prompt: Prompt,
  ): Promise<void> {
    const plainContent = parsedResponse.message.content.parts.join();
    const tokens = encode(plainContent);

    // const message = await this.prismaService.message.create({
    //   data: {
    //     external_id: parsedResponse.message.id,
    //   },
    //   include: {
    //     conversation: true,
    //   },
    // });
  }
}
