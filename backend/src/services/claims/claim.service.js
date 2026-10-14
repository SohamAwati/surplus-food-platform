import prisma from "../../config/prisma.js";

import {
  createTransaction,
} from "../../repositories/transaction.repository.js";
import { sendNotificationToUser } from "../../config/socket.js";

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Claim a listing atomically.
 *
 * Critical rule:
 * Only one claimant can successfully claim a POSTED listing.
 *
 * Phase 7 addition:
 * A successful claim also creates its Transaction
 * atomically in the same database transaction.
 */
export async function claimListing(
  userId,
  listingId,
  notes = ""
) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * =====================================================
       * 1. LOCK THE LISTING
       * =====================================================
       *
       * This protects against concurrent claims.
       */
      const rows = await tx.$queryRaw`
        SELECT
          id,
          "outletId",
          title,
          description,
          category,
          quantity,
          unit,
          "preparedAt",
          "expiresAt",
          status,
          "createdAt",
          "updatedAt"
        FROM "listings"
        WHERE id = ${listingId}::uuid
        FOR UPDATE
      `;

      if (rows.length === 0) {
        throw serviceError(
          "Listing not found.",
          404
        );
      }

      const listing = rows[0];

      /*
       * =====================================================
       * 2. VERIFY CLAIMANT
       * =====================================================
       *
       * Never trust role or verification information
       * from the frontend.
       */
      const claimant = await tx.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          ngoProfile: true,
        },
      });

      if (!claimant) {
        throw serviceError(
          "User not found.",
          404
        );
      }

      if (
        !["NGO", "VOLUNTEER"].includes(
          claimant.role
        )
      ) {
        throw serviceError(
          "Only NGOs and volunteers can claim listings.",
          403
        );
      }

      if (
        claimant.verificationStatus !==
        "VERIFIED"
      ) {
        throw serviceError(
          "Your account must be verified before claiming listings.",
          403
        );
      }

      /*
       * =====================================================
       * 3. VERIFY LISTING STATE
       * =====================================================
       */
      if (listing.status !== "POSTED") {
        throw serviceError(
          "This listing is no longer available.",
          409
        );
      }

      /*
       * =====================================================
       * 4. VERIFY EXPIRY
       * =====================================================
       *
       * Expiry is checked inside the transaction.
       */
      if (
        new Date(listing.expiresAt) <=
        new Date()
      ) {
        await tx.listing.update({
          where: {
            id: listingId,
          },

          data: {
            status: "EXPIRED",
          },
        });

        throw serviceError(
          "This listing has expired.",
          409
        );
      }

      /*
       * =====================================================
       * 5. PREVENT DUPLICATE CLAIM
       * =====================================================
       */
      const existingClaim =
        await tx.claim.findUnique({
          where: {
            listingId_claimantId: {
              listingId,
              claimantId: userId,
            },
          },
        });

      if (existingClaim) {
        if (
          existingClaim.status === "ACTIVE"
        ) {
          throw serviceError(
            "You have already claimed this listing.",
            409
          );
        }

        /*
         * Because of the unique constraint:
         *
         * listingId + claimantId
         *
         * we don't create another claim for the
         * same claimant/listing pair.
         */
        throw serviceError(
          "You have already interacted with this listing.",
          409
        );
      }

      /*
       * =====================================================
       * 6. CREATE CLAIM
       * =====================================================
       */
      const claim = await tx.claim.create({
        data: {
          listingId,
          claimantId: userId,
          status: "ACTIVE",
          notes: notes || null,

          /*
           * NGO gets its NGO profile attached.
           *
           * Volunteers don't have an NGO profile.
           */
          nGOProfileId:
            claimant.role === "NGO"
              ? claimant.ngoProfile?.id ?? null
              : null,
        },

        include: {
          listing: {
            include: {
              outlet: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  isActive: true,
                  donor: {
                    select: {
                      userId: true
                    }
                  }
                },
              },
            },
          },

          claimant: {
            select: {
              id: true,
              email: true,
              role: true,
              verificationStatus: true,
            },
          },

          ngoprofile: {
            select: {
              id: true,
              organizationName: true,
              contactName: true,
              phone: true,
            },
          },
        },
      });

      /*
       * =====================================================
       * 7. MOVE LISTING
       * =====================================================
       *
       * POSTED → CLAIMED
       */
      await tx.listing.update({
        where: {
          id: listingId,
        },

        data: {
          status: "CLAIMED",
        },
      });

      /*
       * =====================================================
       * 8. CREATE TRANSACTION
       * =====================================================
       *
       * Phase 7:
       *
       * Claim
       *   +
       * Listing → CLAIMED
       *   +
       * Transaction
       *
       * Everything happens inside the SAME DB transaction.
       *
       * If transaction creation fails,
       * the claim and listing update are also rolled back.
       */
      const transaction =
        await createTransaction(tx, {
          listingId,
          claimId: claim.id,

          /*
           * If the claimant is a volunteer,
           * associate the transaction with them.
           *
           * NGO claims leave volunteerId null
           * until a volunteer assignment workflow
           * is introduced later.
           */
          volunteerId:
            claimant.role === "VOLUNTEER"
              ? userId
              : null,
        });

      /*
       * =====================================================
       * 9. RETURN CLAIM + TRANSACTION
       * =====================================================
       *
       * We keep the claim response structure while
       * attaching the newly created transaction.
       */
      return {
        ...claim,
        transaction,
      };
    },

    {
      isolationLevel: "Serializable",
    }
  );

  if (result.listing?.outlet?.donor?.userId) {
    sendNotificationToUser(result.listing.outlet.donor.userId, "listing_claimed", {
      listingId: result.listingId,
      claimId: result.id,
      transactionId: result.transaction?.id,
      message: "Your listing has been claimed!"
    });
  }

  return result;
}

/**
 * =========================================================
 * GET MY CLAIMS
 * =========================================================
 *
 * Used by:
 * - NGO
 * - Volunteer
 */
export async function getMyClaims(userId) {
  return prisma.claim.findMany({
    where: {
      claimantId: userId,
    },

    include: {
      listing: {
        include: {
          outlet: {
            select: {
              id: true,
              name: true,
              address: true,
              isActive: true,
            },
          },
        },
      },

      transaction: {
        include: {
          proof: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * =========================================================
 * GET SINGLE CLAIM
 * =========================================================
 *
 * Only the claimant can access their claim.
 */
export async function getMyClaim(
  userId,
  claimId
) {
  const claim =
    await prisma.claim.findUnique({
      where: {
        id: claimId,
      },

      include: {
        listing: {
          include: {
            outlet: {
              select: {
                id: true,
                name: true,
                address: true,
                isActive: true,
              },
            },
          },
        },

        transaction: true,
      },
    });

  if (!claim) {
    throw serviceError(
      "Claim not found.",
      404
    );
  }

  if (claim.claimantId !== userId) {
    throw serviceError(
      "You do not have access to this claim.",
      403
    );
  }

  return claim;
}