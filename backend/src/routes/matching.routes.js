import { Router } from "express";
import { getMatchedListingsController } from "../controllers/matching.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/listings", authenticate, getMatchedListingsController);

export default router;
