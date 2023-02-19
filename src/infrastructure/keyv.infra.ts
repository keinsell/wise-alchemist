import Keyv from "keyv";
import redis from "./redis.infra.js";
import KeyvRedis from "@keyv/redis";

export const keyv = new Keyv({ store: new KeyvRedis(redis) });
