import "reflect-metadata";
import signale from "signale";
import { kv } from "./utils/kv.js";
import { ChatgptModel } from "./utils/scrapper.js";
import { discordService } from "./application/discord/main.js";
import { config } from "dotenv";

config();

signale.info("Setting up server configuration...");

if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
  signale.fatal("Could not find CHATGPT_* environment variables.");
  process.exit(1);
}

await kv.set("auth-token", process.env.CHATGPT_AUTH_TOKEN);
await kv.set("cookies", process.env.CHATGPT_COOKIES);
await kv.set("model", ChatgptModel.turbo);
await kv.set("is-working", false);

await discordService();
