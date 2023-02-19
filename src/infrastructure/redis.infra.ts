import { Redis } from "ioredis";
import signale from "signale";

if (!process.env.REDIS_URI) {
  console.error("Please provide a REDIS_URI");
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URI, {
  retryStrategy: (times) => {
    console.log("could not connect to redis!");
    process.exit(1);
  },
  enableReadyCheck: false,
});

redis.on("connect", () => {
  signale.success("Connected to Redis.");
});

redis.on("error", (err) => {
  signale.error("Error connecting to Redis", err);
});

export default redis;
