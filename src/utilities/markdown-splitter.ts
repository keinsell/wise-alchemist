import { marked } from 'marked';
import TurndownService from 'turndown';

const turndown = new TurndownService();
export function MessageSplitter(message: string): string[] {
  const html = marked(message);
  const blocks = html.split(/(?<=<\/?(?:pre|p)>)/); // split on opening tag of each block
  const messages: string[] = [];
  let currentMessage = '';
  let currentLength = 0;
  let currentBlocks: string[] = [];

  for (const block of blocks) {
    const blockLength = block.length;
    if (currentLength + blockLength > 2000) {
      // adding this block will make the message too long
      messages.push(currentBlocks.join('')); // add the current message to the array of messages
      currentMessage = '';
      currentLength = 0;
      currentBlocks = [];
    }

    if (block.startsWith('<pre')) {
      // this block is a code block, so keep adding blocks until the closing tag is found
      let closingTagIndex = blocks.indexOf(`</pre>${block}`, 1); // find the closing tag of the code block
      if (closingTagIndex === -1) {
        // closing tag not found, so add the current block and move on
        currentBlocks.push(block);
        currentMessage += block;
        currentLength += blockLength;
        continue;
      }

      let codeBlock = '';
      for (let i = blocks.indexOf(block); i < closingTagIndex; i++) {
        codeBlock += blocks[i];
      }
      currentBlocks.push(codeBlock);
      currentMessage += codeBlock;
      currentLength += codeBlock.length;
    } else {
      // this block is not a code block, so add it to the current message
      currentBlocks.push(block);
      currentMessage += block;
      currentLength += blockLength;
    }
  }

  messages.push(currentBlocks.join('')); // add the final message to the array of messages

  const parsedMessages = [];

  for (const message of messages) {
    let parsedMessage = turndown.turndown(message);
    parsedMessages.push(parsedMessage);
  }

  return parsedMessages;
}
