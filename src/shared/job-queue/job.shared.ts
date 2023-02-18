import * as uuid4 from "uuid";
export abstract class Job<T extends Record<string, any>> {
  public id: string;
  public payload: T;

  protected constructor(payload: T) {
    this.payload = payload;
    this.id = uuid4.v4();
  }
  abstract run(): void;
}
