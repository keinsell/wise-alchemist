import { Prisma, PrismaClient } from "@prisma/client";
import signale from "signale";
import { injectable, singleton } from "tsyringe";

@singleton()
export class PrismaService extends PrismaClient {
  private readonly log = signale.scope("PrismaService");

  constructor() {
    super({
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "event",
          level: "error",
        },
        {
          emit: "event",
          level: "info",
        },
        {
          emit: "event",
          level: "warn",
        },
      ],
    });

    this.initialize();
  }

  private async initialize() {
    // Perform any asynchronous initialization tasks here
    await this.$connect();
  }
}
