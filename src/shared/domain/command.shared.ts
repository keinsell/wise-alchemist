export abstract class Command<T = any> {
  constructor(public readonly payload: T) {}
}
