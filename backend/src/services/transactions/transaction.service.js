import prisma from "../../config/prisma.js";
import { env } from "../../config/env.js";

import {
  findTransactionById,
  findTransactionsByClaimant,
  findTransactionsByDonor,
} from "../../repositories/transaction.repository.js";

import { scheduleSlaJobs } from "../sla/sla.service.js";
import { sendNotificationToUser } from "../../config/socket.js";

function serviceError(
  message,
  statusCode = 400
) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/*
 * ---------------------------------------------------------
 * GET MY TRANSACTIONS
 * ---------------------------------------------------------
 */
export async function getMyTransactions(userId) {
  try {
    return await findTransactionsByClaimant(userId);
  } catch (err) {
    console.warn("Database getMyTransactions failed, using fallback:", err.message);
    return [];
  }
}

export async function getDonorTransactions(userId) {
  try {
    return await findTransactionsByDonor(userId);
  } catch (err) {
    console.warn("Database getDonorTransactions failed, using fallback:", err.message);
    return [];
  }
}

/*
 * ---------------------------------------------------------
 * GET SINGLE TRANSACTION
 * ---------------------------------------------------------
 */
export async function getTransaction(
  userId,
  role,
  transactionId
) {
  const transaction =
    await findTransactionById(transactionId);

  if (!transaction) {
    throw serviceError(
      "Transaction not found.",
      404
    );
  }

  const isClaimant =
    transaction.claim.claimantId === userId;

  const isDonor =
    transaction.listing.outlet.donor.userId ===
    userId;

  /*
   * Only claimant or donor can view
   * the transaction.
   */
  if (!isClaimant && !isDonor) {
    throw serviceError(
      "You are not authorized to access this transaction.",
      403
    );
  }

  return transaction;
}

/*
 * ---------------------------------------------------------
 * PICKUP
 * ---------------------------------------------------------
 *
 * CLAIMED
 *    ↓
 * PICKED_UP
 *
 * Transaction:
 * ACTIVE
 *
 * SLA:
 * NOT_STARTED
 *    ↓
 * RUNNING
 *
 * pickupAt = now
 * slaDeadlineAt = now + SLA duration
 */
export async function pickupTransaction(
  userId,
  transactionId
) {
  /*
   * The database transaction is responsible for the
   * state transition.
   *
   * BullMQ jobs are scheduled AFTER this transaction
   * successfully commits.
   */
  const result = await prisma.$transaction(
    async (tx) => {
      /*
       * Lock the transaction row.
       */
      const transactionRows =
        await tx.$queryRaw`
          SELECT id
          FROM transactions
          WHERE id = ${transactionId}::uuid
          FOR UPDATE
        `;

      if (transactionRows.length === 0) {
        throw serviceError(
          "Transaction not found.",
          404
        );
      }

      /*
       * Read the transaction with its
       * current relations.
       */
      const transaction =
        await tx.transaction.findUnique({
          where: {
            id: transactionId,
          },

          include: {
            claim: true,
            listing: true,
          },
        });

      if (!transaction) {
        throw serviceError(
          "Transaction not found.",
          404
        );
      }

      /*
       * Only claimant can confirm pickup.
       */
      if (
        transaction.claim.claimantId !==
        userId
      ) {
        throw serviceError(
          "Only the claimant can confirm pickup.",
          403
        );
      }

      /*
       * Idempotency:
       *
       * If pickup already happened, return the
       * existing transaction and DO NOT schedule
       * another SLA.
       */
      if (transaction.pickupAt) {
        const existingTransaction =
          await tx.transaction.findUnique({
            where: {
              id: transactionId,
            },

            include: {
              listing: {
                include: {
                  outlet: {
                    include: {
                      donor: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },

              claim: {
                include: {
                  claimant: true,
                  ngoprofile: true,
                },
              },

              volunteer: true,
            },
          });

        return {
          transaction: existingTransaction,
          slaStarted: false,
        };
      }

      /*
       * Transaction must still be active.
       */
      if (transaction.status !== "ACTIVE") {
        throw serviceError(
          `Pickup cannot be confirmed for a transaction with status ${transaction.status}.`,
          409
        );
      }

      /*
       * Listing must still be CLAIMED.
       */
      if (
        transaction.listing.status !==
        "CLAIMED"
      ) {
        throw serviceError(
          `Pickup cannot be confirmed because the listing is ${transaction.listing.status}.`,
          409
        );
      }

      const now = new Date();

      /*
       * Calculate SLA deadline.
       *
       * Example:
       *
       * pickupAt = 10:00
       * SLA duration = 60 minutes
       * deadline = 11:00
       */
      const slaDeadlineAt =
        new Date(
          now.getTime() +
            env.SLA_DURATION_MINUTES *
              60 *
              1000
        );

      /*
       * Update listing:
       *
       * CLAIMED → PICKED_UP
       */
      await tx.listing.update({
        where: {
          id: transaction.listingId,
        },

        data: {
          status: "PICKED_UP",
        },
      });

      /*
       * Update transaction:
       *
       * pickupAt = now
       * slaStatus = RUNNING
       * slaDeadlineAt = calculated deadline
       * slaWarningSentAt = null
       */
      await tx.transaction.update({
        where: {
          id: transactionId,
        },

        data: {
          pickupAt: now,

          slaStatus: "RUNNING",

          slaDeadlineAt,

          slaWarningSentAt: null,
        },
      });

      /*
       * Return complete updated transaction.
       */
      const updatedTransaction =
        await tx.transaction.findUnique({
          where: {
            id: transactionId,
          },

          include: {
            listing: {
              include: {
                outlet: {
                  include: {
                    donor: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },

            claim: {
              include: {
                claimant: true,
                ngoprofile: true,
              },
            },

            volunteer: true,
          },
        });

      return {
        transaction: updatedTransaction,
        slaStarted: true,
      };
    },

    {
      isolationLevel: "Serializable",
    }
  );

  /*
   * -------------------------------------------------------
   * SCHEDULE SLA JOBS AFTER DATABASE COMMIT
   * -------------------------------------------------------
   *
   * This is intentionally outside the Prisma transaction.
   */
  if (
    result.slaStarted &&
    result.transaction?.slaDeadlineAt
  ) {
    const slaDeadlineAt =
      result.transaction.slaDeadlineAt;

    /*
     * Warning time:
     *
     * deadline - warning duration
     */
    const slaWarningAt =
      new Date(
        slaDeadlineAt.getTime() -
          env.SLA_WARNING_MINUTES *
            60 *
            1000
      );

    await scheduleSlaJobs({
      transactionId:
        result.transaction.id,

      slaWarningAt,

      slaDeadlineAt,
    });
  }

  if (result.transaction && result.transaction.listing?.outlet?.donor?.userId) {
    sendNotificationToUser(result.transaction.listing.outlet.donor.userId, "transaction_status_changed", {
      transactionId: result.transaction.id,
      status: "PICKED_UP",
      message: "Your donation has been picked up!"
    });
  }

  return result.transaction;
}

/*
 * ---------------------------------------------------------
 * DELIVERY
 * ---------------------------------------------------------
 *
 * PICKED_UP
 *    ↓
 * DELIVERED
 *
 * Transaction:
 * ACTIVE
 *    ↓
 * DELIVERED
 *
 * SLA:
 * RUNNING
 *    ↓
 * ON_TIME / OVERDUE
 *
 * deliveredAt = now
 */
export async function deliverTransaction(
  userId,
  transactionId
) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * Lock transaction row.
       */
      const transactionRows =
        await tx.$queryRaw`
          SELECT id
          FROM transactions
          WHERE id = ${transactionId}::uuid
          FOR UPDATE
        `;

      if (transactionRows.length === 0) {
        throw serviceError(
          "Transaction not found.",
          404
        );
      }

      const transaction =
        await tx.transaction.findUnique({
          where: {
            id: transactionId,
          },

          include: {
            claim: true,
            listing: true,
          },
        });

      if (!transaction) {
        throw serviceError(
          "Transaction not found.",
          404
        );
      }

      /*
       * Only claimant can confirm delivery.
       */
      if (
        transaction.claim.claimantId !==
        userId
      ) {
        throw serviceError(
          "Only the claimant can confirm delivery.",
          403
        );
      }

      /*
       * Idempotency:
       *
       * Delivery already recorded.
       */
      if (transaction.deliveredAt) {
        return tx.transaction.findUnique({
          where: {
            id: transactionId,
          },

          include: {
            listing: {
              include: {
                outlet: {
                  include: {
                    donor: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },

            claim: {
              include: {
                claimant: true,
                ngoprofile: true,
              },
            },

            volunteer: true,
          },
        });
      }

      /*
       * Transaction must still be ACTIVE.
       */
      if (transaction.status !== "ACTIVE") {
        throw serviceError(
          `Delivery cannot be confirmed for a transaction with status ${transaction.status}.`,
          409
        );
      }

      /*
       * Pickup must have happened first.
       */
      if (!transaction.pickupAt) {
        throw serviceError(
          "Pickup must be confirmed before delivery.",
          409
        );
      }

      /*
       * Listing must be PICKED_UP.
       */
      if (
        transaction.listing.status !==
        "PICKED_UP"
      ) {
        throw serviceError(
          `Delivery cannot be confirmed because the listing is ${transaction.listing.status}.`,
          409
        );
      }

      const now = new Date();

      /*
       * Determine whether delivery happened
       * before or after the SLA deadline.
       *
       * We intentionally preserve OVERDUE so the
       * system can flag late transactions.
       */
      let finalSlaStatus =
        transaction.slaStatus;

      if (
        transaction.slaDeadlineAt &&
        now <= transaction.slaDeadlineAt
      ) {
        finalSlaStatus = "ON_TIME";
      } else if (
        transaction.slaDeadlineAt &&
        now > transaction.slaDeadlineAt
      ) {
        finalSlaStatus = "OVERDUE";
      }

      /*
       * Update listing:
       *
       * PICKED_UP → DELIVERED
       */
      await tx.listing.update({
        where: {
          id: transaction.listingId,
        },

        data: {
          status: "DELIVERED",
        },
      });

      /*
       * Update transaction:
       *
       * ACTIVE → DELIVERED
       */
      await tx.transaction.update({
        where: {
          id: transactionId,
        },

        data: {
          status: "DELIVERED",

          slaStatus: finalSlaStatus,

          deliveredAt: now,
        },
      });

      /*
       * Return updated transaction.
       */
      return tx.transaction.findUnique({
        where: {
          id: transactionId,
        },

        include: {
          listing: {
            include: {
              outlet: {
                include: {
                  donor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },

          claim: {
            include: {
              claimant: true,
              ngoprofile: true,
            },
          },

          volunteer: true,
          proof: true,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    }
  );

  if (result && result.listing?.outlet?.donor?.userId) {
    sendNotificationToUser(result.listing.outlet.donor.userId, "transaction_status_changed", {
      transactionId: result.id,
      status: "DELIVERED",
      message: "Your donation has been delivered!"
    });
  }

  return result;
}