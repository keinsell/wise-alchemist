export function splitMessage(message: string): string[] {
  const raw_lines = message.split("\n");
  const MAXIMUM_MESSAGE_LENGTH = 1500;

  const paragraphs: string[] = [];

  // Return complete message if this does not violate budget
  if (message.length < MAXIMUM_MESSAGE_LENGTH) {
    return [message];
  }

  // Build paragraphs by concatenating lines until budget is reached
  let paragraph = "";
  let paragraphCharacters = 0;
  let inCodeBlock = false;
  let codeBlockCharacters = 0;

  for (const line of raw_lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
    }

    if (inCodeBlock) {
      codeBlockCharacters += line.length + 1;
      paragraph += line + "\n";
    } else {
      const lineLength = line.length + 1; // Add 1 to account for newline character
      const potentialLength =
        paragraphCharacters + lineLength + codeBlockCharacters;

      // Search for ``` in the line and replace them with \`\`\`
      const regex = /```/im;
      if (line.search(regex) !== -1) {
        const newLine = line.replace("```", `\`\`\``);
        paragraph += newLine + "\n";
      } else {
        paragraph += line + "\n";
      }

      if (potentialLength > MAXIMUM_MESSAGE_LENGTH) {
        paragraph = paragraph + `\`\`\``;
        paragraphs.push(paragraph.trim());
        paragraph = `\`\`\`` + line + "\n";
        paragraphCharacters = lineLength;
        codeBlockCharacters = 0;
      } else {
        paragraph += line + "\n";
        paragraphCharacters += lineLength;
      }
    }
  }

  paragraphs.push(paragraph.trim());

  return paragraphs;
}
