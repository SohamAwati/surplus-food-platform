import IORedis from "ioredis";
import { env } from "./env.js";

const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 3) return null; // stop retrying after 3 attempts in serverless
    return Math.min(times * 100, 1000);
  },
});

redis.on("connect", () => {
  console.log("Redis connected.");
});

redis.on("ready", () => {
  console.log("Redis ready.");
});

redis.on("error", (error) => {
  console.warn("Redis notice:", error.message);
});

redis.on("close", () => {
  console.log("Redis connection closed.");
});

export default redis;