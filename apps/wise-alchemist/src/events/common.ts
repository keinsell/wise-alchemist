import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class Example {
  @On({ event: "messageCreate" })
  messageCreate([message]: ArgsOf<"messageCreate">, client: Client): void {
    console.log("ads", client.user?.username, message.content);
  }
}
