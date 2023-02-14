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

const CODEBLOCK_REGEX = /^```(\S+)?\n([\s\S]*?)\n```$/gm;
const MAX_MESSAGE_LENGTH = 2000;

export function splitMessage(message: string): string[] {
  const segments = message.split(CODEBLOCK_REGEX);
  const messages: string[] = [];
  let currentMessage = new StringBuilder();
  for (const segment of segments) {
    if (currentMessage.getLength() + segment.length > MAX_MESSAGE_LENGTH) {
      messages.push(currentMessage.toString());
      currentMessage = new StringBuilder();
    }
    if (segment.startsWith("```")) {
      currentMessage.append(segment);
    } else {
      currentMessage.append(
        segment.substring(0, MAX_MESSAGE_LENGTH - currentMessage.getLength())
      );
    }
  }
  messages.push(currentMessage.toString());
  return messages;
}
