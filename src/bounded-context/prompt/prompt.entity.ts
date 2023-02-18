import { Prompt } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";
import { KeyvStore } from "../../shared/keyv-store.js";
import { PromptCreatedEvent } from "./events/prompt-created.event.js";
import { GlobalEventBus } from "../../infrastructure/event-bus/memory.event-bus.infra.js";

export class PromptEntity extends Entity<Prompt> {
  private kvStore = new KeyvStore();
  private eventBus = GlobalEventBus;
  get channelId(): string {
    return this.properties.channelId;
  }
  get id(): number {
    return this.properties.id;
  }

  get content(): string {
    return this.properties.content;
  }

  created() {
    const event = new PromptCreatedEvent({
      id: this.properties.id,
      content: this.properties.content,
      conversationId: this.properties.conversationId || undefined,
    });

    this.eventBus.publish(event);
  }

  async setPendingState() {
    await this.kvStore.set("prompt-" + this.id, "pending");
  }

  async setGeneratingState() {
    await this.kvStore.set("prompt-" + this.id, "generating");
  }

  async setCompletedState() {
    await this.kvStore.set("prompt-" + this.id, "completed");
  }

  async getState(): Promise<"pending" | "generating" | "completed"> {
    const status = await this.kvStore.get<
      "pending" | "generating" | "completed"
    >("prompt-" + this.id);

    if (!status) {
      return "pending";
    } else {
      return status;
    }
  }

  static fromSnapshot(snapshot: Prompt) {
    return new PromptEntity(snapshot);
  }
}
