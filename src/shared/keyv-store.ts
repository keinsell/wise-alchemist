import Keyv from "keyv";

export class KeyvStore {
  private readonly store: Keyv;

  constructor() {
    this.store = new Keyv("redis://localhost:6379");

    this.store.on("error", (error) => console.error(`Keyv error: ${error}`));
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.store.set(key, value, ttl);
    } else {
      await this.store.set(key, value);
    }
  }

  public async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  public async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }

  public async clear(): Promise<void> {
    await this.store.clear();
  }
}
