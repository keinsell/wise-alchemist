import { MessageActivityType } from "discord.js";
import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class OnMessageSent {
  @On({ event: "messageCreate" })
  messageCreate([message]: ArgsOf<"messageCreate">, client: Client): void {
    console.log(message);
  }
}
