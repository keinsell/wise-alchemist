import { randomUUID } from "crypto";
import { kv, setNotWorking, setWorking } from "../utils/kv.js";
import { ChatGPTPlusScrapper, ChatGPTResponse } from "../utils/scrapper.js";
import signale from "signale";

export class LlmService {
  async sendPrompt(
    prompt: string,
    parentMessageId?: string,
    conversationId?: string
  ): Promise<ChatGPTResponse | undefined> {
    // Prepare engine
    const engine = new ChatGPTPlusScrapper(
      await kv.get("model"),
      await kv.get("auth-token"),
      await kv.get("cookies")
    );

    // Set machine state to working
    await setWorking();

    signale.info(`Waiting for prompt: ${prompt.slice(0, 32)}...`);

    // Create message content from the discord message
    const response = await engine.request(
      prompt,
      parentMessageId,
      conversationId
    );

    if (!response) {
      await setNotWorking();
      return;
    }

    signale.success(`Recived response for prompt: ${prompt.slice(0, 32)}...`);

    await setNotWorking();

    return response;
  }
}
