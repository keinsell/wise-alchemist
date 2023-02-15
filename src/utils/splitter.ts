export function splitMessage(message: string): string[] {
  const MAX_LENGTH = 2000;
  const chunks: string[] = [];
  let currentChunk = "";
  let currentLength = 0;
  for (let line of message.split("\n")) {
    if (currentLength + line.length > MAX_LENGTH) {
      chunks.push(currentChunk);
      currentChunk = "";
      currentLength = 0;
    }
    currentChunk += line + "\n";
    currentLength += line.length + 1;
  }
  if (currentLength > 0) {
    chunks.push(currentChunk);
  }
  return chunks;
}
