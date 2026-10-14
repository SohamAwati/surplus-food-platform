import prisma from "../config/prisma.js";

const listingInclude = {
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
};

export function createListing(data) {
  return prisma.listing.create({
    data,
    include: listingInclude,
  });
}

export function findListingById(id) {
  return prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

export function findListingsByDonor(donorId) {
  return prisma.listing.findMany({
    where: {
      outlet: {
        donorId,
      },
    },
    include: listingInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function findActiveListings() {
  return prisma.listing.findMany({
    where: {
      status: "POSTED",
      expiresAt: {
        gt: new Date(),
      },
    },
    include: listingInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function updateListing(id, data) {
  return prisma.listing.update({
    where: { id },
    data,
    include: listingInclude,
  });
}

export function deleteListing(id) {
  return prisma.listing.delete({
    where: { id },
  });
}