import { Message } from "@prisma/client";
import signale from "signale";
import { v4 as uuid } from "uuid";
import Queue from "bull";

export enum ChatgptModel {
  turbo = "text-davinci-002-render-sha",
  normal = "text-davinci-002-render-paid",
}

export interface ChatgptMessage {
  id: string;
  role: string;
  user: null | any;
  create_time: null | any;
  update_time: null | any;
  content: {
    content_type: string;
    parts: string[];
  };
  end_turn: boolean;
  weight: number;
  metadata: {
    message_type: string;
    model_slug: string;
    finish_details: {
      type: string;
      stop: string;
    };
  };
  recipient: string;
}

export type ChatgptResponse = {
  message: ChatgptMessage;
  conversation_id: string;
  error: null | any;
};

export interface ChatgptOptions {
  conversationId?: string;
  parentMessageId?: string;
  model?: ChatgptModel;
}

export async function prompt(
  prompt: string,
  options?: ChatgptOptions | undefined
): Promise<ChatgptResponse & { parentMesasageId: string }> {
  // Extract options
  let { conversationId, parentMessageId, model } = options || {};

  // If parntMessageId is missing generate a new one with uuid
  if (!parentMessageId) {
    parentMessageId = uuid();
  }

  let response: Response | undefined;

  try {
    response = await fetch(`https://chat.openai.com/backend-api/conversation`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: process.env.CHATGPT_AUTH_TOKEN!,
        Cookie: process.env.CHATGPT_COOKIES!,
      }),
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: uuid(),
            role: "user",
            content: {
              content_type: "text",
              parts: [prompt],
            },
          },
        ],
        parent_message_id: parentMessageId,
        model: model || ChatgptModel.turbo,
        conversation_id: conversationId,
      }),
    });
  } catch (error) {
    throw new Error(JSON.stringify(error));
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
    throw new Error(parsed.detail);
  }

  const final = result[result.length - 2];
  const index = final.indexOf("data:");
  const jsonString = final.substring(index + 6);

  const parsedResponse = JSON.parse(jsonString) as ChatgptResponse;

  return { ...parsedResponse, parentMesasageId: parentMessageId };
}
