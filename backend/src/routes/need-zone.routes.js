import { Router } from "express";
import { createNeedZoneController, getNeedZonesController, getNearbyListingsController } from "../controllers/need-zone.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", getNeedZonesController);
router.post("/", authenticate, authorize(["ADMIN", "NGO"]), createNeedZoneController);
router.get("/nearby", authenticate, getNearbyListingsController);

export default router;
