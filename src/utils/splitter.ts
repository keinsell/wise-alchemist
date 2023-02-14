class StringBuilder {
  private buffer: string[] = [];
  private length = 0;

  append(segment: string) {
    this.buffer.push(segment);
    this.length += segment.length;
  }

  toString() {
    return this.buffer.join("");
  }

  getLength() {
    return this.length;
  }
}

const MAX_MESSAGE_LENGTH = 2000;

export function splitMessage(message: string): string[] {
  const lines = message.split("\n");
  const messages: string[] = [];
  let currentMessage = "";
  let inCodeBlock = false;

  for (const line of lines) {
    const lineLength = line.length + 1; // add 1 for the newline character
    if (inCodeBlock) {
      currentMessage += line + "\n";
      if (line.startsWith("```")) {
        inCodeBlock = false;
      }
    } else if (line.startsWith("```")) {
      const remaining = MAX_MESSAGE_LENGTH - currentMessage.length;
      if (remaining < 3) {
        // need at least 3 characters for a closing code block delimiter
        messages.push(currentMessage);
        currentMessage = "";
      }
      inCodeBlock = true;
      currentMessage += line + "\n";
    } else if (currentMessage.length + lineLength > MAX_MESSAGE_LENGTH) {
      // If the last line of the current message is part of a code block, remove it
      if (inCodeBlock) {
        const codeBlockRegex = /^```.*\n[\s\S]*```.*\n$/m;
        const match = currentMessage.match(codeBlockRegex);
        if (match) {
          currentMessage = currentMessage.slice(0, match.index) + match[0];
        }
      }
      messages.push(currentMessage);
      currentMessage = line + "\n";
    } else {
      currentMessage += line + "\n";
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
}
