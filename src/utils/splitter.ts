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
  const chunkSize = MAX_MESSAGE_LENGTH;
  const codeBlockRegex = /^```[\s\S]*?^```/gm;
  const chunks: string[] = [];

  let match;
  let lastIndex = 0;
  while ((match = codeBlockRegex.exec(message))) {
    const codeBlockStart = match.index;
    const codeBlockEnd = codeBlockRegex.lastIndex;
    if (codeBlockStart > lastIndex) {
      // Add text before the code block
      chunks.push(message.substring(lastIndex, codeBlockStart));
    }
    const codeBlock = message.substring(codeBlockStart, codeBlockEnd);
    if (codeBlock.length <= chunkSize) {
      // Add the code block as a single chunk
      chunks.push(codeBlock);
    } else {
      // Split the code block into multiple chunks
      const codeChunks = [];
      let start = 0;
      while (start < codeBlock.length) {
        let end = Math.min(start + chunkSize, codeBlock.length);
        const chunk = codeBlock.substring(start, end);
        if (chunk.match(/^```/g)) {
          // If the chunk starts with a new code block, remove the closing code block
          const closingCodeBlockIndex = chunk.lastIndexOf("```");
          codeChunks.push(chunk.substring(0, closingCodeBlockIndex));
          end -= chunk.length - closingCodeBlockIndex;
        } else if (chunk.match(/```$/g)) {
          // If the chunk ends with a closing code block, remove the opening code block
          const openingCodeBlockIndex = chunk.indexOf("```");
          codeChunks.push(chunk.substring(openingCodeBlockIndex + 3));
          end -= openingCodeBlockIndex + 3;
        } else {
          codeChunks.push(chunk);
        }
        start = end;
      }
      chunks.push(codeChunks.join(""));
    }
    lastIndex = codeBlockEnd;
  }
  if (lastIndex < message.length) {
    // Add text after the last code block
    chunks.push(message.substring(lastIndex));
  }
  return chunks;
}
