import prisma from "../../config/prisma.js";
import { logAudit } from "../audit/audit.service.js";
import { processTransactionRewards } from "../rewards/reward.service.js";
import { sendNotificationToUser } from "../../config/socket.js";

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function submitProof(userId, transactionId, { imageUrl, notes, beneficiaryCount }) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        claim: true,
        proof: true,
        listing: {
          include: {
            outlet: {
              include: {
                donor: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      throw serviceError("Transaction not found.", 404);
    }

    const isClaimant = transaction.claim?.claimantId === userId;
    const isAssignedVolunteer = transaction.volunteerId === userId;

    if (!isClaimant && !isAssignedVolunteer) {
      throw serviceError("Only the claimant or assigned volunteer can submit proof.", 403);
    }

    if (transaction.status !== "DELIVERED") {
      throw serviceError(`Cannot submit proof. Transaction status is ${transaction.status}.`, 409);
    }

    if (transaction.proof) {
      throw serviceError("Proof has already been submitted for this transaction.", 409);
    }

    const proof = await tx.proofOfDistribution.create({
      data: {
        transactionId,
        uploadedById: userId,
        imageUrl,
        notes,
        beneficiaryCount
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        }
      }
    });

    await logAudit({
      actorId: userId,
      action: "SUBMIT_PROOF",
      entityType: "Transaction",
      entityId: transactionId,
      metadata: { imageUrl, beneficiaryCount }
    });

    if (transaction.listing?.outlet?.donor?.userId) {
      sendNotificationToUser(transaction.listing.outlet.donor.userId, "proof_submitted", {
        transactionId,
        message: "Proof of distribution has been submitted."
      });
    }

    return proof;
  });
}

export async function acknowledgeProof(userId, transactionId) {
  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        listing: {
          include: {
            outlet: {
              include: {
                donor: true
              }
            }
          }
        },
        claim: true,
        proof: true
      }
    });

    if (!transaction) {
      throw serviceError("Transaction not found.", 404);
    }

    const donor = transaction.listing?.outlet?.donor;
    const isDonorUser = donor?.userId === userId;
    const isDonorProfile = transaction.listing?.outlet?.donorId === userId;

    if (!isDonorUser && !isDonorProfile) {
      const donorProfile = await tx.donorProfile.findUnique({
        where: { id: transaction.listing?.outlet?.donorId }
      });
      if (!donorProfile || donorProfile.userId !== userId) {
        throw serviceError("Only the donor can acknowledge proof.", 403);
      }
    }

    if (transaction.status !== "DELIVERED") {
      throw serviceError(`Cannot acknowledge proof. Transaction status is ${transaction.status}.`, 409);
    }

    if (!transaction.proof) {
      throw serviceError("Proof of distribution has not been submitted yet.", 409);
    }

    const now = new Date();

    // 1. Update listing
    await tx.listing.update({
      where: { id: transaction.listingId },
      data: { status: "CLOSED" }
    });

    // 2. Update claim if present
    if (transaction.claimId) {
      await tx.claim.update({
        where: { id: transaction.claimId },
        data: { status: "COMPLETED" }
      });
    }

    // 3. Update transaction
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: "CLOSED",
        closedAt: now
      },
      include: {
        listing: true,
        claim: true,
        proof: true
      }
    });

    await logAudit({
      actorId: userId,
      action: "ACKNOWLEDGE_PROOF",
      entityType: "Transaction",
      entityId: transactionId,
      metadata: { status: "CLOSED" }
    });

    if (updatedTransaction.claim?.claimantId) {
      sendNotificationToUser(updatedTransaction.claim.claimantId, "proof_acknowledged", {
        transactionId,
        status: "CLOSED",
        message: "Your proof was acknowledged! The transaction is now closed."
      });
    }

    return updatedTransaction;
  });

  try {
    await processTransactionRewards(transactionId);
  } catch (err) {
    console.error("Failed to process transaction rewards:", err);
  }

  return updatedTransaction;
}
