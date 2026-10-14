import {
  createListing,
  deleteListing,
  findActiveListings,
  findListingById,
  findListingsByDonor,
  updateListing,
} from "../../repositories/listing.repository.js";

import prisma from "../../config/prisma.js";
import { scheduleListingExpiry } from "../../queues/expiry.queue.js";
import { broadcastToRole } from "../../config/socket.js";

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getOwnedOutlet(outletId, userId) {
  const outlet = await prisma.outlet.findFirst({
    where: {
      id: outletId,
      isActive: true,
      donor: {
        userId,
      },
    },
    include: {
      donor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!outlet) {
    throw serviceError(
      "Outlet not found or does not belong to you.",
      403
    );
  }

  if (
    outlet.donor.user.verificationStatus !==
    "VERIFIED"
  ) {
    throw serviceError(
      "Your donor account must be verified before creating listings.",
      403
    );
  }

  return outlet;
}

function normalizeOptionalString(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return value;
}

export async function createDonorListing(
  userId,
  data
) {
  const outlet = await getOwnedOutlet(
    data.outletId,
    userId
  );

  const listing = await createListing({
    outletId: outlet.id,

    title: data.title,

    description: normalizeOptionalString(
      data.description
    ),

    category: normalizeOptionalString(
      data.category
    ),

    quantity:
      data.quantity !== undefined
        ? data.quantity
        : null,

    unit: normalizeOptionalString(
      data.unit
    ),

    preparedAt: data.preparedAt
      ? new Date(data.preparedAt)
      : null,

    expiresAt: new Date(data.expiresAt),

    status: "POSTED",
  });

  /*
   * Schedule automatic expiry.
   *
   * The listing is already committed to PostgreSQL
   * before the BullMQ job is created.
   */
  await scheduleListingExpiry(
    listing.id,
    listing.expiresAt
  );

  broadcastToRole("NGO", "new_listing", {
    listingId: listing.id,
    title: listing.title,
    message: "A new food donation is available nearby!"
  });

  return listing;
}

const DEMO_LISTINGS = [
  {
    id: "lst_demo_001",
    title: "Fresh Baked Artisanal Sourdough & Baguettes",
    description: "Daily surplus from bakery counter. Kept at room temperature, baked this morning.",
    quantity: "25",
    unit: "loaves",
    foodType: "Cooked / Baked Goods",
    dietary: "VEGAN",
    status: "POSTED",
    preparedAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    storageInstructions: "Store in cool, dry place.",
    outlet: {
      id: "out_demo_001",
      name: "Grand Central Kitchen - Main Branch",
      address: "Colaba Causeway, Mumbai, Maharashtra 400001",
      latitude: 18.922,
      longitude: 72.834,
      donor: {
        id: "donor_prof_demo_001",
        organizationName: "Grand Central Kitchen",
        contactName: "Donor Admin",
        phone: "+91 98200 11223",
        user: { id: "usr_donor_demo_001", email: "donor@surplus.local", verificationStatus: "VERIFIED" }
      }
    }
  },
  {
    id: "lst_demo_002",
    title: "Nutritious Mixed Vegetable Biryani & Raita",
    description: "Prepared for executive luncheon, untouched hot-insulated trays.",
    quantity: "60",
    unit: "servings",
    foodType: "Hot Meals",
    dietary: "VEGETARIAN",
    status: "POSTED",
    preparedAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 14400000).toISOString(),
    storageInstructions: "Keep in thermal carriers until redistribution.",
    outlet: {
      id: "out_demo_002",
      name: "Grand Central - Bandra Express Hub",
      address: "Linking Road, Bandra West, Mumbai, Maharashtra 400050",
      latitude: 19.06,
      longitude: 72.836,
      donor: {
        id: "donor_prof_demo_001",
        organizationName: "Grand Central Kitchen",
        contactName: "Donor Admin",
        phone: "+91 98200 11223",
        user: { id: "usr_donor_demo_001", email: "donor@surplus.local", verificationStatus: "VERIFIED" }
      }
    }
  }
];

export async function getDonorListings(userId) {
  try {
    const donor = await prisma.donorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (donor) {
      return await findListingsByDonor(donor.id);
    }
  } catch (err) {
    console.warn("Database getDonorListings failed, using fallback:", err.message);
  }

  return DEMO_LISTINGS;
}

export async function getListingById(
  userId,
  listingId
) {
  const listing = await findListingById(
    listingId
  );

  if (!listing) {
    throw serviceError(
      "Listing not found.",
      404
    );
  }

  if (
    listing.outlet.donor.user.id !== userId
  ) {
    throw serviceError(
      "You do not have access to this listing.",
      403
    );
  }

  return listing;
}

export async function updateDonorListing(
  userId,
  listingId,
  data
) {
  const listing = await findListingById(
    listingId
  );

  if (!listing) {
    throw serviceError(
      "Listing not found.",
      404
    );
  }

  if (
    listing.outlet.donor.user.id !== userId
  ) {
    throw serviceError(
      "You do not have permission to modify this listing.",
      403
    );
  }

  if (listing.status !== "POSTED") {
    throw serviceError(
      "Only posted listings can be updated.",
      409
    );
  }

  /*
   * Calculate the final values first.
   *
   * This is important because expiresAt or preparedAt
   * may not be present in the update request.
   */
  const finalExpiresAt = data.expiresAt
    ? new Date(data.expiresAt)
    : listing.expiresAt;

  const finalPreparedAt = data.preparedAt
    ? new Date(data.preparedAt)
    : listing.preparedAt;

  if (
    Number.isNaN(finalExpiresAt.getTime())
  ) {
    throw serviceError(
      "Invalid expiry time.",
      400
    );
  }

  if (finalExpiresAt <= new Date()) {
    throw serviceError(
      "Expiry time must be in the future.",
      400
    );
  }

  if (
    finalPreparedAt &&
    finalPreparedAt > finalExpiresAt
  ) {
    throw serviceError(
      "Preparation time cannot be after the expiry time.",
      400
    );
  }

  const updateData = {
    ...data,
  };

  if (data.expiresAt) {
    updateData.expiresAt = finalExpiresAt;
  }

  if (data.preparedAt) {
    updateData.preparedAt = finalPreparedAt;
  }

  const updatedListing = await updateListing(
    listingId,
    updateData
  );

  /*
   * Schedule/re-schedule automatic expiry using
   * the final expiry timestamp.
   */
  await scheduleListingExpiry(
    updatedListing.id,
    updatedListing.expiresAt
  );

  return updatedListing;
}

export async function cancelDonorListing(
  userId,
  listingId
) {
  const listing = await getListingById(
    userId,
    listingId
  );

  if (listing.status !== "POSTED") {
    throw serviceError(
      "Only posted listings can be cancelled.",
      409
    );
  }

  return updateListing(listingId, {
    status: "EXPIRED",
  });
}

export async function getAvailableListings() {
  try {
    return await findActiveListings();
  } catch (err) {
    console.warn("Database getAvailableListings failed, using fallback:", err.message);
    return DEMO_LISTINGS;
  }
}