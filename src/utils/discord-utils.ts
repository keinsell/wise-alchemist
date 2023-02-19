import { DMChannel, TextChannel } from "discord.js";
import { discord } from "../infrastructure/discord.infra.js";
import { keyv } from "../infrastructure/keyv.infra.js";
import delay from "delay";

export async function sendMessageOnChannelId(
  channelId: string,
  message: string,
  replyToMessageId?: string
): Promise<void> {
  const channel = await discord.channels.fetch(channelId);

  if (!channel) return;

  // Handle sending messages in DMs
  if (channel.isDMBased()) {
    const dmChannel = channel as unknown as DMChannel;
    await dmChannel.send(message);
    return;
  }

  // Handle sending messages in channels
  if (channel.isTextBased()) {
    const textChannel = channel as unknown as TextChannel;
    await textChannel.send({
      reply: replyToMessageId
        ? { messageReference: replyToMessageId }
        : undefined,
      content: message,
    });
  }
}

export const DISCORD_TYPING_INTERVAL = 3000;

export async function stopTypingOnChannelId(channelId: string): Promise<void> {
  await keyv.set(`typing-${channelId}`, false, 60000); // 1 minute
}

export async function startTypingOnChannelId(channelId: string): Promise<void> {
  const channel = await discord.channels.fetch(channelId);
  await keyv.set(`typing-${channelId}`, true, 10000); // 10 second

  if (!channel.isTextBased()) return;

  const textChannel = channel as unknown as TextChannel;

  while (await keyv.get(`typing-${channelId}`)) {
    await textChannel.sendTyping();
    await delay(7500);
  }

  await stopTypingOnChannelId(channelId);
}
