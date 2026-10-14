import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const slaQueue = new Queue("transaction-sla", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

slaQueue.on("error", (error) => {
  console.warn("[SLA Queue notice]:", error.message);
});