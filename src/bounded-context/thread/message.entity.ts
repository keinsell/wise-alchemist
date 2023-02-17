import { Message } from "@prisma/client";
import { Entity } from "../../shared/domain/entity.shared.js";

export class MessageEntity extends Entity<Message> {}
