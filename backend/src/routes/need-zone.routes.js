import { Router } from "express";
import {
  createNeedZoneController,
  getNeedZonesController,
  getNearbyListingsController,
  getActiveOutletsController,
} from "../controllers/need-zone.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", getNeedZonesController);
router.get("/outlets", getActiveOutletsController);
router.post("/", authenticate, authorize(["ADMIN", "NGO"]), createNeedZoneController);
router.get("/nearby", authenticate, getNearbyListingsController);
router.get("/nearby-listings", authenticate, getNearbyListingsController);

export default router;
