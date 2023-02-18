import { PrismaClient } from "@prisma/client";
import signale from "signale";
import { singleton } from "tsyringe";

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

    this.$connect();
  }
}

export const prisma = new PrismaService();
