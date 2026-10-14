import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  createClaim,
  getClaim,
  listMyClaims,
} from "../controllers/claim.controller.js";

const router = Router();

router.use(authenticate);

/*
 * NGO / Volunteer claim a listing.
 */
router.post(
  "/:listingId/claim",
  authorize("NGO", "VOLUNTEER"),
  createClaim
);

/*
 * Current user's claims.
 */
router.get(
  "/mine",
  authorize("NGO", "VOLUNTEER"),
  listMyClaims
);

/*
 * Current user's individual claim.
 */
router.get(
  "/mine/:claimId",
  authorize("NGO", "VOLUNTEER"),
  getClaim
);

export default router;