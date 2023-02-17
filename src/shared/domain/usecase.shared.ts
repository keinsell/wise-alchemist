import { Command } from "./command.shared.js";
import { ResultAsync } from "neverthrow";

export abstract class Usecase<I extends Command, O, E = never> {
  abstract execute(input: I): ResultAsync<O, E>;
}
