import { BingChat } from "bing-chat";

if (!process.env.BING_COOKIE) {
  console.log("BING_COOKIE is not defined");
  process.exit(1);
}

export const bingchat = new BingChat({
  cookie: process.env.BING_COOKIE,
});
