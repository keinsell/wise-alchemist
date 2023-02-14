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
  const result: string[] = [];

  let currentBlock: string[] = [];
  let currentLength = 0;

  for (const element of lines) {
    const line = element;
    const isCodeBlock = line.startsWith("```");
    const lineLength = line.length + 1; // Add 1 for the newline character

    if (isCodeBlock) {
      // Flush the current block if it exceeds the character limit
      if (
        currentLength + lineLength > MAX_MESSAGE_LENGTH &&
        currentBlock.length > 0
      ) {
        result.push(currentBlock.join("\n"));
        currentBlock = [];
        currentLength = 0;
      }
    }

    currentBlock.push(line);
    currentLength += lineLength;

    // Flush the current block if it exceeds the character limit
    if (currentLength > MAX_MESSAGE_LENGTH) {
      currentBlock.pop(); // Remove the last line that caused the overflow
      currentLength -= lineLength;
      result.push(currentBlock.join("\n"));
      currentBlock = [line];
      currentLength = lineLength;
    }
  }

  // Add the last block to the result
  result.push(currentBlock.join("\n"));

  return result;
}
