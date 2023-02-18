import { DomainError } from "../../../shared/domain/domain-error.shared.js";

export class PromptNotFound extends DomainError {
  constructor() {
    super(`Prompt not found.`);
  }
}
