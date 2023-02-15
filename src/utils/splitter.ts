function splitMarkdownForDiscord(markdown: string): string[] {
  const MAX_LENGTH = 2000;
  const marked = markdown.replace(/\n/g, "\r");
  const paragraphs = marked.split(/\r\s*\r/g);
  const chunks: string[] = [];

  let currentChunk = "";
  let currentLength = 0;

  for (let paragraph of paragraphs) {
    const isCodeBlock = /```([\s\S]*?)```/.test(paragraph);

    if (isCodeBlock) {
      const codeBlock = paragraph.match(/```([\s\S]*?)```/)![0];
      const codeBlockLength = codeBlock.length;

      if (currentLength + codeBlockLength > MAX_LENGTH) {
        chunks.push(currentChunk);
        currentChunk = "";
        currentLength = 0;
      }

      currentChunk += codeBlock;
      currentLength += codeBlockLength;

      // Remove the code block from the paragraph before processing the rest of the text
      paragraph.replace(/```([\s\S]*?)```/, "");
    }

    while (paragraph.length > 0) {
      const remainingLength = MAX_LENGTH - currentLength;

      if (paragraph.length <= remainingLength) {
        currentChunk += paragraph;
        currentLength += paragraph.length;
        break;
      }

      const substring = paragraph.substring(0, remainingLength);
      const lastNewlineIndex = substring.lastIndexOf("\n");

      if (lastNewlineIndex === -1) {
        chunks.push(currentChunk);
        currentChunk = "";
        currentLength = 0;
        continue;
      }

      const chunk = paragraph.substring(0, lastNewlineIndex);
      currentChunk += chunk;
      currentLength += chunk.length;
      chunks.push(currentChunk);
      currentChunk = "";
      currentLength = 0;

      paragraph = paragraph.substring(lastNewlineIndex + 1);
    }
  }

  const result: string[] = [];

  for (const chunk of chunks) {
    const message = chunk.replace(/\r/g, "\n");
    result.push(message);
  }

  return result;
}

export function splitMessage(message: string): string[] {
  return splitMarkdownForDiscord(message);
}
