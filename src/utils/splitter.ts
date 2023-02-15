export function splitMessage(message: string): string[] {
  const raw_lines = message.split("\n");
  const MAXIMUM_MESSAGE_LENGTH = 1500;

  const paragraphs: string[] = [];

  // Build paragraphs by concatenating lines until budget is reached
  let paragraph = "";
  let paragraphCharacters = 0;
  let inCodeBlock = false;

  for (const line of raw_lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      paragraph += "ˋˊ" + line.substring(3) + "\n";
      continue;
    }

    if (inCodeBlock) {
      const lineContent = line.replace(/`/g, "ˋ");
      paragraph += lineContent + "\n";
      continue;
    }

    const lineContent = line.replace(/`/g, "ˋ");
    const lineLength = lineContent.length + 1; // Add 1 to account for newline character
    const potentialLength = paragraphCharacters + lineLength;

    if (potentialLength > MAXIMUM_MESSAGE_LENGTH) {
      paragraphs.push(paragraph.trim());
      paragraph = lineContent + "\n";
      paragraphCharacters = lineLength;
    } else {
      paragraph += lineContent + "\n";
      paragraphCharacters += lineLength;
    }
  }

  paragraphs.push(paragraph.trim());

  return paragraphs;
}
