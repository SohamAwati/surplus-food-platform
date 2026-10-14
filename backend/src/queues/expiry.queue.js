import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const expiryQueue = new Queue("listing-expiry", {
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

expiryQueue.on("error", (error) => {
  console.warn("[Expiry Queue notice]:", error.message);
});

/**
 * Schedule a listing to be checked at its expiry time.
 *
 * The job is delayed until expiresAt.
 *
 * If the worker starts slightly before the exact time,
 * the expiry service will re-check the database and
 * safely return NOT_EXPIRED.
 */
export async function scheduleListingExpiry(
  listingId,
  expiresAt
) {
  const expiryTime = new Date(expiresAt).getTime();

  const delay = Math.max(
    0,
    expiryTime - Date.now()
  );

  const job = await expiryQueue.add(
    "expire-listing",
    {
      listingId,
    },
    {
      delay,

      /*
       * One deterministic job ID per listing + expiry time.
       *
       * If the listing expiry time is changed later,
       * a new job can be created safely.
       */
      jobId: `expire-listing-${listingId}-${expiryTime}`,
    }
  );

  console.log(
    `[Expiry Queue] Scheduled ${listingId} in ${delay}ms`
  );

  return job;
}