import prisma from "../../config/prisma.js";

export async function expireListing(listingId) {
  /*
   * Only expire a listing if:
   *
   * 1. It still exists
   * 2. It is still POSTED
   * 3. Its expiry time has actually passed
   *
   * This makes the operation safe to retry.
   */

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },

    select: {
      id: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!listing) {
    return {
      changed: false,
      reason: "NOT_FOUND",
    };
  }

  /*
   * Already claimed / picked up / delivered /
   * closed / expired.
   *
   * Do nothing.
   */
  if (listing.status !== "POSTED") {
    return {
      changed: false,
      reason: `STATUS_${listing.status}`,
    };
  }

  /*
   * The worker may run slightly early.
   */
  if (listing.expiresAt > new Date()) {
    return {
      changed: false,
      reason: "NOT_EXPIRED",
    };
  }

  /*
   * Re-check the state in the UPDATE itself.
   *
   * This protects against a race where another operation
   * changes the listing between findUnique() and update().
   */
  const result = await prisma.listing.updateMany({
    where: {
      id: listingId,
      status: "POSTED",
      expiresAt: {
        lte: new Date(),
      },
    },

    data: {
      status: "EXPIRED",
    },
  });

  if (result.count === 0) {
    return {
      changed: false,
      reason: "STATE_CHANGED",
    };
  }

  return {
    changed: true,
    reason: "EXPIRED",
  };
}