import signale from "signale";
import chalk from "chalk";

export abstract class DomainEvent<T> {
  public readonly type: string;
  public readonly createdAt: Date;
  public readonly payload: T;

  constructor(type: string, payload: T) {
    this.type = type;
    this.payload = payload;
    this.createdAt = new Date();
    signale.info(`DomainEvent::${type}`);
    signale.info(chalk.grey(JSON.stringify(this.payload)));
  }
}
