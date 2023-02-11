import { generateUUID } from "./uuid.js";
import { ChatGPTResponse } from "./types.js";
import { ChatgptModel, ChatgptModelType } from "./models.js";

export class ChatGPTPlusScrapper {
  constructor(
    private model: ChatgptModelType,
    private authorizationHeader: string,
    private cookies: string
  ) {}

  public createUUID(): string {
    return generateUUID();
  }

  public async request(
    prompt: string,
    parentMessageId: string = generateUUID(),
    conversationId?: string | undefined
  ): Promise<ChatGPTResponse | undefined> {
    let response: Response | undefined;

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
                  parts: [prompt],
                },
              },
            ],
            parent_message_id: parentMessageId,
            model: this.model,
            conversation_id: conversationId,
          }),
        }
      );
    } catch (error) {
      console.log(error);
      return undefined;
    }

    if (!response) {
      return undefined;
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

    const final = result[result.length - 2];
    const index = final.indexOf("data:");
    const jsonString = final.substring(index + 6);
    return JSON.parse(jsonString);
  }
}

export { ChatgptModel, ChatgptModelType };
