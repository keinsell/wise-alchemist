import { Account } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";

export class AccountEntity extends Entity<Account> {
  static fromSnapshot(newAccount: Account): AccountEntity {
    return new AccountEntity(newAccount);
  }
}
