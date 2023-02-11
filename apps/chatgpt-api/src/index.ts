import { ChatGPTPlusScrapper } from "../../../packages/chatgpt-plus-scrapper/dist";
import { config } from "dotenv";
import express from "express";
import { ChatGPTResponse } from "../../../packages/chatgpt-wrapper/src/types";

config();

const scrapper = new ChatGPTPlusScrapper(
  "text-davinci-002-render-paid",
  process.env.CHATGPT_AUTH_TOKEN,
  process.env.CHATGPT_COOKIES
);

const app = express();

let isRequestInProcess = false;
const conversation = scrapper.createUUID();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/ask", async (request, response) => {
  if (isRequestInProcess) {
    return response.status(500).end();
  }

  isRequestInProcess = true;

  const { text: requestText } = request.body;

  if (!requestText) {
    return response.status(400).end();
  }

  const apiRequest = await scrapper.request(requestText, conversation);

  isRequestInProcess = false;

  if (!apiRequest) {
    return response.status(204).end();
  }

  return response
    .status(200)
    .json({ text: apiRequest.message.content.parts[0] });
});

// Run application
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Application started at ${port}`);
});
