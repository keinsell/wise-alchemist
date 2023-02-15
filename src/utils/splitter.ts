function splitMarkdownString(input: string, limit: number): string[] {
  const paragraphs = input.split("\n\n");
  const output: string[] = [];
  let currentString = "";

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];

    if (currentString.length + paragraph.length <= limit) {
      currentString += paragraph + "\n\n";
    } else if (isCodeBlock(paragraph)) {
      currentString += paragraph + "\n\n";
    } else {
      let splitIndex = findLastNewlineIndex(
        paragraph,
        limit - currentString.length
      );
      if (splitIndex === -1) {
        output.push(currentString);
        currentString = paragraph + "\n\n";
      } else {
        currentString += paragraph.slice(0, splitIndex) + "\n\n";
        output.push(currentString);
        currentString = paragraph.slice(splitIndex) + "\n\n";
      }
    }
  }

  if (currentString.length > 0) {
    output.push(currentString);
  }

  return output;
}

function isCodeBlock(paragraph: string): boolean {
  const codeBlockRegex = /^`{3}.+[\r\n]+([\s\S]*?)\r?\n`{3}$/gm;
  return codeBlockRegex.test(paragraph);
}

function findLastNewlineIndex(str: string, limit: number): number {
  let splitIndex = -1;
  for (let i = 0; i < Math.min(str.length, limit); i++) {
    if (str[i] === "\n") {
      splitIndex = i;
    }
  }
  return splitIndex;
}

const MAX_MESSAGE_LENGTH = 2000;

export function splitMessage(message: string): string[] {
  return splitMarkdownString(message, MAX_MESSAGE_LENGTH);
}
