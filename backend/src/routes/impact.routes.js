import { Router } from "express";
import { getGlobalImpactController, getMyImpactController } from "../controllers/impact.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/global", getGlobalImpactController);
router.get("/me", authenticate, getMyImpactController);

export default router;
