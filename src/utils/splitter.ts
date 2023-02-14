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
  let currentCharCount = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    const lineLength = line.length + 1; // add 1 for the newline character
    if (inCodeBlock) {
      currentMessage += line + "\n";
      if (line.startsWith("```")) {
        inCodeBlock = false;
      }
    } else if (line.startsWith("```")) {
      inCodeBlock = true;
      currentMessage += line + "\n";
    } else if (currentCharCount + lineLength > MAX_MESSAGE_LENGTH) {
      messages.push(currentMessage);
      currentMessage = line + "\n";
      currentCharCount = lineLength;
    } else {
      currentMessage += line + "\n";
      currentCharCount += lineLength;
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
}
