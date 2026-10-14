import { Worker } from "bullmq";

import redis from "../config/redis.js";
import { expireListing } from "../services/listings/listing-expiry.service.js";

const expiryWorker = new Worker(
  "listing-expiry",
  async (job) => {
    const { listingId } = job.data;

    if (!listingId) {
      throw new Error(
        "Expiry job is missing listingId."
      );
    }

    console.log(
      `[Expiry Worker] Processing listing ${listingId}`
    );

    const result = await expireListing(
      listingId
    );

    console.log(
      `[Expiry Worker] ${listingId}: ${result.reason}`
    );

    return result;
  },
  {
    connection: redis,

    concurrency: 5,
  }
);

expiryWorker.on("completed", (job, result) => {
  console.log(
    `[Expiry Worker] Job ${job.id} completed:`,
    result
  );
});

expiryWorker.on("failed", (job, error) => {
  console.error(
    `[Expiry Worker] Job ${job?.id} failed:`,
    error
  );
});

expiryWorker.on("error", (error) => {
  console.error(
    "[Expiry Worker] Worker error:",
    error
  );
});

console.log(
  "Listing expiry worker started."
);

export default expiryWorker;