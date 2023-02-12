import { ChatGPTPlusScrapper, ChatgptModel } from "chatgpt-plus-scrapper";
import { MessageActivityType } from "discord.js";
import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

let isWorking = false;
let preivousMessage: string | undefined = undefined;
let conversationId: string | undefined = undefined;

@Discord()
export class OnMessageSent {
  @On({ event: "messageCreate" })
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    // If message is made by bot, do not proceed further
    if (message.author.bot) return;

    // Check if message in on allowed "random" channel.
    if (message.channel.id !== "1074137070395740250") return;

    // Proceed with chatting with users as GPT.
    const scrapper = new ChatGPTPlusScrapper(
      ChatgptModel.turbo,
      process.env.CHATGPT_AUTH_TOKEN!,
      process.env.CHATGPT_COOKIES!
    );

    // If bot is working, check again every 5 seconds until it is free.
    while (isWorking) {
      await new Promise((resolve) => {
        message.channel.sendTyping();
        setTimeout(resolve, 500);
      });
    }

    // Set bot as working.
    isWorking = true;

    const typingInterval = setInterval(() => {
      message.channel.sendTyping();
    }, 1000);

    // Use chat method to generate response 1 second later
    const response = await scrapper.request(
      message.content,
      preivousMessage,
      conversationId
    );

    isWorking = false;

    // Log response to the console
    console.log(response);

    // Log conversation id
    console.log(response?.conversation_id);
    conversationId = response?.conversation_id;

    // Log previous message.
    console.log(preivousMessage);
    preivousMessage = response?.message.id;

    clearInterval(typingInterval);

    // Send response to the discord channel.
    message.reply({
      content: response?.message.content.parts[0]!,
    });
  }
}
