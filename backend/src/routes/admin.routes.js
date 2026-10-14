import { Router } from "express";
import { getAllUsersController, verifyUserController, getAuditLogsController, getTransactionsAdminController, getAllDisputesController, resolveDisputeController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// All routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/users", getAllUsersController);
router.put("/users/:userId/verify", verifyUserController);
router.get("/audit-logs", getAuditLogsController);
router.get("/transactions", getTransactionsAdminController);
router.get("/disputes", getAllDisputesController);
router.put("/disputes/:disputeId/resolve", resolveDisputeController);

export default router;
