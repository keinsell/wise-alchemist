import { DomainError } from "../../../../../shared/domain/domain-error.shared.js";

export class InvalidChatgptResponse extends DomainError {
  constructor(argumentName: string) {
    super(`Chatgpt response has failed with following error: ${argumentName}`);
  }
}
