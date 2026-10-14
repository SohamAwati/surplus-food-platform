import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const notificationQueue = new Queue(
  "notification-send",
  {
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
  }
);

notificationQueue.on("error", (error) => {
  console.warn("[Notification Queue notice]:", error.message);
});