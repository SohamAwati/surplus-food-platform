import { getAllUsers, verifyUser, getAuditLogs, getTransactionsAdmin, getAllDisputes, resolveDispute } from "../services/admin/admin.service.js";

export async function getAllUsersController(req, res, next) {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function verifyUserController(req, res, next) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const user = await verifyUser(userId, status);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogsController(req, res, next) {
  try {
    const logs = await getAuditLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsAdminController(req, res, next) {
  try {
    const txs = await getTransactionsAdmin();
    res.json({ success: true, data: txs });
  } catch (error) {
    next(error);
  }
}

export async function getAllDisputesController(req, res, next) {
  try {
    const disputes = await getAllDisputes();
    res.json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
}

export async function resolveDisputeController(req, res, next) {
  try {
    const { disputeId } = req.params;
    const { resolution } = req.body;
    const resolved = await resolveDispute(req.user.id, disputeId, resolution);
    res.json({ success: true, data: resolved });
  } catch (error) {
    next(error);
  }
}
