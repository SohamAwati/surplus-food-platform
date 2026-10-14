import prisma from "../config/prisma.js";

const claimInclude = {
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
              id: true,
              organizationName: true,
              contactName: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  verificationStatus: true,
                },
              },
            },
          },
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
  transaction: true,
};

export function findClaimById(id) {
  return prisma.claim.findUnique({
    where: { id },
    include: claimInclude,
  });
}

export function findClaimsByClaimant(claimantId) {
  return prisma.claim.findMany({
    where: {
      claimantId,
    },
    include: claimInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function findClaimByListingAndClaimant(listingId, claimantId) {
  return prisma.claim.findUnique({
    where: {
      listingId_claimantId: {
        listingId,
        claimantId,
      },
    },
    include: claimInclude,
  });
}