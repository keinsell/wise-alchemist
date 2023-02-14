import MarkdownIt from "markdown-it";

const MAX_MESSAGE_LENGTH = 2000;

export function splitMessage(message: string): string[] {
  const md = new MarkdownIt();
  const tokens = md.parse(message, {});

  const messages: string[] = [];
  let currentMessage = "";
  let currentCharCount = 0;

  for (const token of tokens) {
    const tokenString = md.renderer.render([token], md.options, {});
    const tokenLength = tokenString.length;

    if (currentCharCount + tokenLength > MAX_MESSAGE_LENGTH) {
      messages.push(currentMessage);
      currentMessage = tokenString;
      currentCharCount = tokenLength;
    } else {
      currentMessage += tokenString;
      currentCharCount += tokenLength;
    }

    if (token.type === "fence") {
      // If the token is a code block, start a new message after the code block ends
      messages.push(currentMessage);
      currentMessage = "";
      currentCharCount = 0;
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
}
