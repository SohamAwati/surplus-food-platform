import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getMyTransactionsController,
  getDonorTransactionsController,
  getTransactionController,
  pickupTransactionController,
  deliverTransactionController,
} from "../controllers/transaction.controller.js";

const router = Router();

/*
 * All transaction routes require authentication.
 */
router.use(authenticate);

/*
 * ---------------------------------------------------------
 * CLAIMANT TRANSACTIONS
 * ---------------------------------------------------------
 *
 * NGO / VOLUNTEER
 */
router.get(
  "/mine",
  authorize("NGO", "VOLUNTEER"),
  getMyTransactionsController
);

/*
 * ---------------------------------------------------------
 * DONOR TRANSACTIONS
 * ---------------------------------------------------------
 */
router.get(
  "/donor",
  authorize("DONOR"),
  getDonorTransactionsController
);

/*
 * ---------------------------------------------------------
 * SINGLE TRANSACTION
 * ---------------------------------------------------------
 *
 * Claimant or donor ownership is checked
 * inside the service.
 */
router.get(
  "/:transactionId",
  authorize(
    "DONOR",
    "NGO",
    "VOLUNTEER"
  ),
  getTransactionController
);

/*
 * ---------------------------------------------------------
 * PICKUP
 * ---------------------------------------------------------
 *
 * Claimant only.
 */
router.post(
  "/:transactionId/pickup",
  authorize("NGO", "VOLUNTEER"),
  pickupTransactionController
);

/*
 * ---------------------------------------------------------
 * DELIVERY
 * ---------------------------------------------------------
 *
 * Claimant only.
 */
router.post(
  "/:transactionId/delivery",
  authorize("NGO", "VOLUNTEER"),
  deliverTransactionController
);

export default router;