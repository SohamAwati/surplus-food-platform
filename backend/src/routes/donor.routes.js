import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getProfile,
  updateProfile,
  getOutlets,
  createOutletHandler,
  getOutlet,
  updateOutletHandler,
  deleteOutletHandler,
} from "../controllers/donor.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("DONOR"));

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

router.get("/outlets", getOutlets);
router.post("/outlets", createOutletHandler);

router.get("/outlets/:outletId", getOutlet);
router.patch("/outlets/:outletId", updateOutletHandler);
router.delete("/outlets/:outletId", deleteOutletHandler);

export { router as donorRouter };