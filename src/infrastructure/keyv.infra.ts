import Keyv from "keyv";

export const keyv = new Keyv(process.env.REDIS_URL!);
