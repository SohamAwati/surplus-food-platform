import prisma from "../../config/prisma.js";
import { expiryQueue } from "../../queues/expiry.queue.js";

export async function scheduleExpiredListings() {
  const now = new Date();

  /*
   * Find listings that:
   *
   * - are still POSTED
   * - have reached expiry
   */
  const listings = await prisma.listing.findMany({
    where: {
      status: "POSTED",

      expiresAt: {
        lte: now,
      },
    },

    select: {
      id: true,
      expiresAt: true,
    },

    take: 100,
  });

  if (listings.length === 0) {
    return 0;
  }

  for (const listing of listings) {
    await expiryQueue.add(
      "expire-listing",
      {
        listingId: listing.id,
      },
      {
        jobId: `expire-listing-${listing.id}`,
      }
    );
  }

  return listings.length;
}