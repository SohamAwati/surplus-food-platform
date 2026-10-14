import prisma from "../../config/prisma.js";

export async function logAudit({
  actorId,
  action,
  entityType,
  entityId,
  metadata
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata
      }
    });
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to record audit log:", error);
  }
}
