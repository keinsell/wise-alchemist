import { ChatGPTPlusScrapper, ChatgptModel } from "chatgpt-plus-scrapper";
import { config } from "dotenv";
import express from "express";
import signale from "signale";
import { kv } from "./kv/kv";

config();

// Setup environment variables to key value store

signale.info("Setting up server configuration...");

if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
  signale.fatal("Could not find CHATGPT_* environment variables.");
  process.exit(1);
}

await kv.set("auth-token", process.env.CHATGPT_AUTH_TOKEN);
await kv.set("cookies", process.env.CHATGPT_COOKIES);
await kv.set("model", ChatgptModel.turbo);

signale.success("Server configuration set up.");

// Prepare ChatGPTPlusScrapper SDK

const mainscrapper = new ChatGPTPlusScrapper(
  await kv.get("model"),
  await kv.get("auth-token"),
  await kv.get("cookies")
);

// Prepare Express Application

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

await kv.set("is-working", false);
await kv.set("parent-message", mainscrapper.createUUID());

app.post("/ask", async (request, response) => {
  const chatGPTPlusScrapper = new ChatGPTPlusScrapper(
    await kv.get("model"),
    await kv.get("auth-token"),
    await kv.get("cookies")
  );

  if (await kv.get("is-working")) {
    return response.status(500).end();
  }

  await kv.set("is-working", true);

  const { text: requestText } = request.body;

  if (!requestText) {
    return response.status(400).end();
  }

  signale.info(`Asking for: ${requestText}...`);

  const conversation_id = await kv.get("conversation-id");

  const apiRequest = await chatGPTPlusScrapper.request(
    requestText,
    await kv.get("parent-message"),
    conversation_id
  );

  console.log(conversation_id);
  console.log(await kv.get("parent-message"));

  await kv.set("is-working", false);

  if (!apiRequest) {
    signale.error("Could not get response. Invalid API Request.");
    return response.status(204).end();
  }

  await kv.set("parent-message", apiRequest.message.id);
  await kv.set("conversation-id", apiRequest.conversation_id);

  signale.success(`AI Responded: ${apiRequest.message.content.parts[0]}`);

  return response
    .status(200)
    .json({ text: apiRequest.message.content.parts[0] });
});

// Endpoint used for configuring the ChatGPT wrapper
// This should allow for swapping model, auth-token and cookies
app.post("/configure", async (request, response) => {
  const { model, "auth-token": authToken, cookies } = request.body;

  // Set local environment variables from body parameters
  if (model) {
    await kv.set("model", ChatgptModel[model as keyof typeof ChatgptModel]);
  }

  if (authToken) {
    await kv.set("auth-token", authToken);
  }

  if (cookies) {
    await kv.set("cookies", cookies);
  }

  return response.status(200).end();
});

// Run application
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Application started at ${port}`);
});
