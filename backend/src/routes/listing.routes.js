import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  cancelListing,
  createListing,
  getDonorListing,
  listAvailableListings,
  listDonorListings,
  updateListing,
} from "../controllers/listing.controller.js";

const router = Router();

router.use(authenticate);

/*
 * Donor listing management
 */

router.post(
  "/",
  authorize("DONOR"),
  createListing
);

router.get(
  "/mine",
  authorize("DONOR"),
  listDonorListings
);

router.get(
  "/mine/:listingId",
  authorize("DONOR"),
  getDonorListing
);

router.patch(
  "/mine/:listingId",
  authorize("DONOR"),
  updateListing
);

router.post(
  "/mine/:listingId/cancel",
  authorize("DONOR"),
  cancelListing
);

/*
 * Available listings.
 *
 * This endpoint will eventually be consumed
 * by NGO / Volunteer listing feeds.
 */

router.get(
  "/available",
  authorize("NGO", "VOLUNTEER"),
  listAvailableListings
);

export default router;