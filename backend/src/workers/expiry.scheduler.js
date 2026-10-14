import { scheduleExpiredListings } from "../services/listings/listing-expiry.scheduler.js";

let running = false;

async function runExpiryScheduler() {
  if (running) {
    return;
  }

  running = true;

  try {
    const count =
      await scheduleExpiredListings();

    if (count > 0) {
      console.log(
        `[Expiry Scheduler] Queued ${count} expired listing(s).`
      );
    }
  } catch (error) {
    console.error(
      "[Expiry Scheduler] Failed:",
      error
    );
  } finally {
    running = false;
  }
}

/*
 * Run once immediately.
 */
await runExpiryScheduler();

/*
 * Check every 30 seconds.
 */
const interval = setInterval(
  runExpiryScheduler,
  30_000
);

process.on("SIGTERM", () => {
  clearInterval(interval);
});

process.on("SIGINT", () => {
  clearInterval(interval);
});

console.log(
  "Listing expiry scheduler started."
);