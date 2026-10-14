import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { processSlaWarning, processSlaCheck } from "../services/sla/sla.service.js";

export const slaWorker = new Worker(
  "transaction-sla",
  async (job) => {
    const { transactionId } = job.data;

    switch (job.name) {
      case "sla-warning":
        await processSlaWarning(transactionId);
        break;
      case "sla-check":
        await processSlaCheck(transactionId);
        break;
      default:
        console.warn(`Unknown job name: ${job.name} in transaction-sla queue`);
    }
  },
  { connection: redis }
);

slaWorker.on("completed", (job) => {
  console.log(`[SLA WORKER] Job ${job.name} completed for transaction ${job.data.transactionId}`);
});

slaWorker.on("failed", (job, err) => {
  console.error(`[SLA WORKER] Job ${job?.name} failed for transaction ${job?.data?.transactionId}:`, err);
});
