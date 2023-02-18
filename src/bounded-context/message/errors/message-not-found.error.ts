import { DomainError } from "../../../shared/domain/domain-error.shared.js";

export class MessageNotFound extends DomainError {
  constructor() {
    super(`Message not found.`);
  }
}
