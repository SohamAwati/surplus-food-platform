import {
  claimListing as claimListingService,
  getMyClaims,
  getMyClaim,
} from "../services/claims/claim.service.js";

import { createClaimSchema } from "../validators/claim.validator.js";

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export async function createClaim(req, res, next) {
  try {
    const { listingId } = req.params;

    const parsed = createClaimSchema.safeParse(req.body ?? {});

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid request.",
        },
      });
    }

    const claim = await claimListingService(
      req.user.id,
      listingId,
      parsed.data.notes
    );

    return sendSuccess(res, claim, 201);
  } catch (error) {
    next(error);
  }
}

export async function listMyClaims(req, res, next) {
  try {
    const claims = await getMyClaims(req.user.id);

    return sendSuccess(res, claims);
  } catch (error) {
    next(error);
  }
}

export async function getClaim(req, res, next) {
  try {
    const claim = await getMyClaim(
      req.user.id,
      req.params.claimId
    );

    return sendSuccess(res, claim);
  } catch (error) {
    next(error);
  }
}