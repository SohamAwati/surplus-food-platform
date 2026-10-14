import { Router } from "express";
import { submitProofController, acknowledgeProofController } from "../controllers/proof.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post(
  "/:transactionId",
  authenticate,
  authorize(["NGO", "VOLUNTEER"]),
  upload.single("image"),
  submitProofController
);

router.post(
  "/:transactionId/acknowledge",
  authenticate,
  authorize(["DONOR"]),
  acknowledgeProofController
);

export default router;
