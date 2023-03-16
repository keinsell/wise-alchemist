import marked from 'marked';
import TurndownService from 'turndown';

// Function to split HTML into chunks up to 2000 characters
function splitHtmlIntoChunks(input: string, maxChunkLength = 2000): string[] {
  const chunks: string[] = [];
  const paragraphs = input.split(/<\/?p>/).filter((p) => p.trim().length > 0);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const wrappedParagraph = `<p>${paragraph}</p>`;

    if (currentChunk.length + wrappedParagraph.length > maxChunkLength) {
      chunks.push(currentChunk);
      currentChunk = wrappedParagraph;
    } else {
      currentChunk += wrappedParagraph;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// Function to convert HTML chunks to Discord-acceptable Markdown
function convertChunksToDiscordMarkdown(chunks: string[]): string[] {
  const turndownService = new TurndownService();

  // Add a custom rule to handle bold text
  turndownService.addRule('bold', {
    filter: ['strong', 'b'],
    replacement: (content: string) => {
      return `**${content}**`;
    },
  });

  // Add a custom rule to handle italic text
  turndownService.addRule('italic', {
    filter: ['em', 'i'],
    replacement: (content: string) => {
      return `*${content}*`;
    },
  });

  // Add a custom rule to handle strikethrough text
  turndownService.addRule('strikethrough', {
    filter: 'del',
    replacement: (content: string) => {
      return `~~${content}~~`;
    },
  });

  // Add a custom rule to handle inline code
  turndownService.addRule('inlineCode', {
    filter: 'code',
    replacement: (content: string) => {
      return `\`${content}\``;
    },
  });

  // Add a custom rule to handle URLs
  turndownService.addRule('urls', {
    filter: 'a',
    replacement: (content: string, node: HTMLElement) => {
      const href = node.getAttribute('href');
      return `${href}`;
    },
  });

  // Add a custom rule to handle code blocks
  turndownService.addRule('codeblocks', {
    filter: 'pre',
    replacement: (content: string, node: HTMLElement) => {
      const codeElement = node.querySelector('code');
      const codeContent = codeElement?.textContent || content;
      return `\`\`\`\n${codeContent}\n\`\`\``;
    },
  });

  return chunks.map((chunk) => turndownService.turndown(chunk));
}

// Main function to parse, split and convert
function processMessageToDiscordChunks(message: string): string[] {
  const html = marked.marked(message);
  const htmlChunks = splitHtmlIntoChunks(html);
  const discordMarkdownChunks = convertChunksToDiscordMarkdown(htmlChunks);

  return discordMarkdownChunks;
}
export function MessageSplitter(message: string): string[] {
  const messageChunks = processMessageToDiscordChunks(message);
  return messageChunks;
}
