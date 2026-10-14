import prisma from "../../config/prisma.js";
import { slaQueue } from "../../queues/sla.queue.js";
import { sendNotificationToUser } from "../../config/socket.js";

export async function scheduleSlaJobs({ transactionId, slaWarningAt, slaDeadlineAt }) {
  const now = new Date();

  // Calculate delay in ms
  const warningDelay = Math.max(0, slaWarningAt.getTime() - now.getTime());
  const checkDelay = Math.max(0, slaDeadlineAt.getTime() - now.getTime());

  await slaQueue.add(
    "sla-warning",
    { transactionId },
    {
      delay: warningDelay,
      jobId: `sla-warning-${transactionId}`,
    }
  );

  await slaQueue.add(
    "sla-check",
    { transactionId },
    {
      delay: checkDelay,
      jobId: `sla-check-${transactionId}`,
    }
  );
}

export async function processSlaWarning(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) return;

  if (transaction.slaStatus !== "RUNNING" || transaction.status !== "ACTIVE") {
    return; 
  }
  
  if (transaction.slaWarningSentAt) {
    return; 
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { slaWarningSentAt: new Date() }
  });

  const claim = await prisma.claim.findUnique({
    where: { id: transaction.claimId }
  });

  if (claim) {
    sendNotificationToUser(claim.claimantId, "sla_warning", {
      transactionId,
      message: "Warning: Your SLA deadline for this transaction is approaching!"
    });
  }
}

export async function processSlaCheck(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) return;

  if (transaction.slaStatus !== "RUNNING" || transaction.status !== "ACTIVE") {
    return;
  }

  const now = new Date();
  if (transaction.slaDeadlineAt && now >= transaction.slaDeadlineAt) {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { slaStatus: "OVERDUE" }
    });

    const claim = await prisma.claim.findUnique({
      where: { id: transaction.claimId }
    });

    if (claim) {
      sendNotificationToUser(claim.claimantId, "sla_overdue", {
        transactionId,
        message: "Your transaction SLA is now OVERDUE."
      });
    }
  }
}
