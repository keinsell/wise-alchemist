import Queue, { DoneCallback, Job } from "bull";
import signale from "signale";
import { ChatgptModel, ChatgptResponse, prompt } from "./llm.js";
import { prisma } from "./infrastructure/prisma.infra.js";
import { encode } from "gpt-3-encoder";
import { discord } from "./infrastructure/discord.infra.js";
import { DMChannel, TextChannel } from "discord.js";
import { splitMessage } from "./utils/message-splitting.js";
import {
  DISCORD_TYPING_INTERVAL,
  sendMessageOnChannelId,
  startTypingOnChannelId,
  stopTypingOnChannelId,
} from "./utils/discord-utils.js";

interface LlmQueuePayload {
  messageContent: string;
  conversationId?: string;
  parentMessageId?: string;
  model?: ChatgptModel;
  discordChannelId: string;
  discordMessageId: string;
  discordUserId: string;
  _retry?: number;
}

const llmQueue = new Queue<LlmQueuePayload>("llm", {
  redis: process.env.REDIS_URL!,
  // Limiq queue to max 1 jobs per one minute.
  //   limiter: {
  //     max: 1,
  //     duration: 1000 * 60,
  //   },
});

llmQueue.process(async function (
  job: Job<LlmQueuePayload>,
  done: DoneCallback
) {
  signale.info(`Received job async with payload: ${JSON.stringify(job.data)}`);

  if (!job.data._retry) {
    job.data._retry = 0;
  } else if (job.data._retry >= 3) {
    await job.moveToFailed(new Error("Max retries reached."), false);
    return done(new Error("Max retries reached."));
  }

  let chatgptResponse:
    | (ChatgptResponse & { parentMesasageId: string })
    | undefined = undefined;

  // Start typing.
  const typingInterval = setInterval(() => {
    startTypingOnChannelId(job.data.discordChannelId);
  }, DISCORD_TYPING_INTERVAL);

  try {
    chatgptResponse = await prompt(job.data.messageContent, {
      conversationId: job.data.conversationId,
      parentMessageId: job.data.parentMessageId,
      model: job.data.model,
    });
  } catch (error) {
    signale.error(`Caught error: ${error}`);
    await llmQueue.add(
      { ...job.data, _retry: job.data._retry + 1 },
      { delay: 10000 }
    );

    // Stop typing.
    stopTypingOnChannelId(job.data.discordChannelId);
    clearInterval(typingInterval);

    return done(error);
  }

  const content = chatgptResponse.message.content.parts[0];
  const tokens = encode(content);

  // Save response in database
  const message = await prisma.message.create({
    data: {
      id: chatgptResponse.message.id,
      output: content,
      input: job.data.messageContent,
      tokensUsed: tokens.length,
      parentMessageId: chatgptResponse.parentMesasageId,
      model: job.data.model || chatgptResponse.message.metadata.model_slug,
      discordMessageId: job.data.discordMessageId,
      discordUserId: job.data.discordUserId,
      conversation: {
        connectOrCreate: {
          where: {
            id: chatgptResponse.conversation_id,
          },
          create: {
            id: chatgptResponse.conversation_id,
            channelId: job.data.discordChannelId,
          },
        },
      },
    },
  });

  // Stop typing.
  stopTypingOnChannelId(job.data.discordChannelId);
  clearInterval(typingInterval);

  signale.info(`Created message ${message.id}`);

  // Send message with Discord
  const chunks = splitMessage(content);

  for (const chunk of chunks) {
    sendMessageOnChannelId(
      job.data.discordChannelId,
      chunk,
      job.data.discordMessageId
    );
  }

  return done();
});

llmQueue.on("completed", () => {
  signale.success("Completed");
});

llmQueue.on("resumed", () => {
  signale.success("LLM Queue is up and ready to go!");
});

export { llmQueue };
