import { Message } from "@prisma/client";
import { createConversation } from "../module.conversation/create-conversation.js";
import { findLatestMessageInConversation } from "./find-latest-message-in-conversation.js";
import { v4 as uuidv4 } from "uuid";
import { ChatGPTPlusScrapper } from "../utils/scrapper.js";
import { kv, setNotWorking, setWorking } from "../utils/kv.js";
import { encode, decode } from "gpt-3-encoder";
import { prisma } from "../infra.prisma/prisma.infra.js";

export async function createMessage(properties: {
  fromDiscordUserId: string;
  fromDiscordMessageId: string;
  fromDiscordChannelId: string;
  messageContent: string;
  conversationId?: string;
}) {
  let parentMessageId: string | undefined = undefined;

  if (properties.conversationId) {
    // Find latest message in given conversation
    const recentMessage: Message | undefined =
      await findLatestMessageInConversation(properties.conversationId);

    if (recentMessage) {
      parentMessageId = recentMessage.id;
    } else {
      parentMessageId = uuidv4();
    }
  }

  const thisMessageId = uuidv4();

  // Prepare engine
  const engine = new ChatGPTPlusScrapper(
    await kv.get("model"),
    await kv.get("auth-token"),
    await kv.get("cookies")
  );

  // Set machine state to working
  await setWorking();

  // Create message content from the discord message
  const response = await engine.request(
    properties.messageContent,
    parentMessageId,
    properties.conversationId
  );

  if (!response) {
    await setNotWorking();
    return;
  }

  await setNotWorking();

  // Extract generated content to string
  const raw_string = response.message.content.parts[0];
  const tokens_used = encode(raw_string).length;
  const model = response.message.metadata.model_slug;
  const conversationId = response.conversation_id;

  // Save conversation
  const conversation = await createConversation({
    id: conversationId,
    discordChannelId: properties.fromDiscordChannelId,
  });

  // Save message
  const message = await prisma.message.create({
    data: {
      id: thisMessageId,
      parentMessageId: parentMessageId,
      discordUserId: properties.fromDiscordUserId,
      discordMessageId: properties.fromDiscordMessageId,
      input: properties.messageContent,
      output: raw_string,
      tokensUsed: tokens_used,
      model,
      conversation: {
        connect: { id: conversation.id },
      },
    },
  });

  return message;
}
