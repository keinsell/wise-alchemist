import { Command } from "./command.shared.js";
import { Result } from "neverthrow";

export abstract class Usecase<I extends Command, O, E = never> {
  abstract execute(input: I): Promise<Result<O, E>>;
}
