import { Router } from "express";
import { getMyRewardsController } from "../controllers/reward.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/me", authenticate, getMyRewardsController);

export default router;
