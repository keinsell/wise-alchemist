export class Exception extends Error {
  constructor(
    public readonly message: string,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
