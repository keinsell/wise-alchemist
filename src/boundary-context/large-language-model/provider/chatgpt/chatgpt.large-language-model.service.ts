import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { LargeLanguageModelProvider } from '../../large-language-model.provider';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@prisma/client';
import { ChatgptModel } from './chatgpt.model';
import { randomUUID } from 'node:crypto';
import { ChatgptResponse } from './chatgpt.response';
import { encode } from 'gpt-3-encoder';
import { ConversationService } from 'src/boundary-context/conversation/conversation.service';
import { MessageService } from 'src/boundary-context/message/message.service';

export interface ChatgptLargeLanguageModelOptions {
  model: ChatgptModel;
  conversationId?: string;
  parentMessageId?: string;
}

@Injectable()
export class ChatgptLargeLanguageModelService
  implements LargeLanguageModelProvider<ChatgptLargeLanguageModelOptions>
{
  private logger = new Logger(ChatgptLargeLanguageModelService.name);
  private readonly authorizationHeader: string;
  private readonly cookies: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {
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
    let conversationId = options?.conversationId;
    let parentMessageId = options?.parentMessageId;
    let model = options?.model;
    let messageId = randomUUID();

    // If parntMessageId is missing generate a new one with uuid
    if (!parentMessageId) {
      parentMessageId = randomUUID();
    }

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
      //   prompt.setFailedState();
      //   throw new InvalidChatgptResponse(parsed.detail);
    }

    const final = result[result.length - 2];
    const index = final.indexOf('data:');
    const jsonString = final.substring(index + 6);

    const parsedResponse = JSON.parse(jsonString) as ChatgptResponse;
    const plainContent = parsedResponse.message.content.parts.join();
    const tokens = encode(plainContent);

    // Find conversation by Id, if not found create one.
  }
}
