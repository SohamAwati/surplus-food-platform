import prisma  from "../config/prisma.js";

const transactionInclude = {
  listing: {
    include: {
      outlet: {
        include: {
          donor: {
            select: {
              id: true,
              userId: true,
              organizationName: true,
              contactName: true,
              phone: true,
              address: true,

              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  verificationStatus: true,
                  isActive: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      },
    },
  },

  claim: {
    include: {
      claimant: {
        select: {
          id: true,
          email: true,
          role: true,
          verificationStatus: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      ngoprofile: {
        select: {
          id: true,
          userId: true,
          organizationName: true,
          contactName: true,
          phone: true,
          address: true,
          beneficiaryCount: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },

  volunteer: true,
};

/*
 * Find a transaction by ID.
 */
export async function findTransactionById(
  transactionId
) {
  return prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: transactionInclude,
  });
}

/*
 * Find transactions belonging to a claimant.
 *
 * Works for both:
 * - NGO
 * - VOLUNTEER
 *
 * The claimant relationship is stored on Claim.
 */
export async function findTransactionsByClaimant(
  userId
) {
  return prisma.transaction.findMany({
    where: {
      claim: {
        claimantId: userId,
      },
    },

    include: transactionInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
 * Find transactions belonging to a donor.
 *
 * Donor ownership is determined through:
 *
 * Transaction
 *   -> Listing
 *      -> Outlet
 *         -> DonorProfile
 *            -> User
 */
export async function findTransactionsByDonor(
  userId
) {
  return prisma.transaction.findMany({
    where: {
      listing: {
        outlet: {
          donor: {
            userId,
          },
        },
      },
    },

    include: transactionInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
 * Create the transaction associated with a successful claim.
 *
 * This is called from the claim service so that
 * Claim + Listing + Transaction are created atomically.
 */
export async function createTransaction(
  tx,
  {
    listingId,
    claimId,
    volunteerId = null,
  }
) {
  return tx.transaction.create({
    data: {
      listingId,
      claimId,
      volunteerId,
      status: "ACTIVE",
      slaStatus: "NOT_STARTED",
    },

    include: transactionInclude,
  });
}

/*
 * Update transaction fields.
 */
export async function updateTransaction(
  transactionId,
  data
) {
  return prisma.transaction.update({
    where: {
      id: transactionId,
    },

    data,

    include: transactionInclude,
  });
}