import {
  createListingSchema,
  updateListingSchema,
} from "../validators/listing.validator.js";

import {
  cancelDonorListing,
  createDonorListing,
  getAvailableListings,
  getDonorListings,
  getListingById,
  updateDonorListing,
} from "../services/listings/listing.service.js";

function sendSuccess(
  res,
  data,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export async function createListing(
  req,
  res,
  next
) {
  try {
    const validated =
      createListingSchema.parse(req.body);

    const listing =
      await createDonorListing(
        req.user.id,
        validated
      );

    return sendSuccess(
      res,
      listing,
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function listDonorListings(
  req,
  res,
  next
) {
  try {
    const listings =
      await getDonorListings(
        req.user.id
      );

    return sendSuccess(
      res,
      listings
    );
  } catch (error) {
    next(error);
  }
}

export async function getDonorListing(
  req,
  res,
  next
) {
  try {
    const listing =
      await getListingById(
        req.user.id,
        req.params.listingId
      );

    return sendSuccess(
      res,
      listing
    );
  } catch (error) {
    next(error);
  }
}

export async function updateListing(
  req,
  res,
  next
) {
  try {
    const validated =
      updateListingSchema.parse(req.body);

    const listing =
      await updateDonorListing(
        req.user.id,
        req.params.listingId,
        validated
      );

    return sendSuccess(
      res,
      listing
    );
  } catch (error) {
    next(error);
  }
}

export async function cancelListing(
  req,
  res,
  next
) {
  try {
    const listing =
      await cancelDonorListing(
        req.user.id,
        req.params.listingId
      );

    return sendSuccess(
      res,
      listing
    );
  } catch (error) {
    next(error);
  }
}

export async function listAvailableListings(
  req,
  res,
  next
) {
  try {
    const listings =
      await getAvailableListings();

    return sendSuccess(
      res,
      listings
    );
  } catch (error) {
    next(error);
  }
}