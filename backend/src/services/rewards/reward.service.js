import prisma from "../../config/prisma.js";
import { logAudit } from "../audit/audit.service.js";

export async function processTransactionRewards(transactionId) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        claim: true,
        listing: {
          include: {
            outlet: true
          }
        },
        proof: true
      }
    });

    if (!transaction) return;

    if (transaction.status !== "CLOSED") return;

    // Check idempotency: have we already rewarded this transaction?
    const existingRewards = await tx.rewardLedger.findMany({
      where: { transactionId }
    });

    if (existingRewards.length > 0) {
      // Already processed
      return;
    }

    // Rules logic:
    // 1. Successful delivery (Volunteer/NGO): +20 points
    // 2. On-time delivery: +10 points
    // We will hardcode these rules or fetch from RewardRule table.
    const rules = await tx.rewardRule.findMany({
      where: { isActive: true }
    });

    const claimantId = transaction.claim.claimantId;
    const donorId = transaction.listing.outlet.donorId; // Wait, we need the User ID of the donor, not donorProfile ID
    const donorProfile = await tx.donorProfile.findUnique({
      where: { id: transaction.listing.outlet.donorId }
    });
    const donorUserId = donorProfile?.userId;

    let pointsToAwardClaimant = 0;
    let pointsToAwardDonor = 0;

    const successfulDeliveryRule = rules.find(r => r.actionType === "SUCCESSFUL_DELIVERY");
    const onTimeDeliveryRule = rules.find(r => r.actionType === "ON_TIME_DELIVERY");
    const successfulDonationRule = rules.find(r => r.actionType === "SUCCESSFUL_DONATION");

    if (successfulDeliveryRule) {
      pointsToAwardClaimant += successfulDeliveryRule.points;
    } else {
      pointsToAwardClaimant += 20; // Fallback
    }

    if (transaction.slaStatus === "ON_TIME" || transaction.slaStatus === "COMPLETED") {
      if (onTimeDeliveryRule) {
        pointsToAwardClaimant += onTimeDeliveryRule.points;
      } else {
        pointsToAwardClaimant += 10; // Fallback
      }
    }

    if (successfulDonationRule) {
      pointsToAwardDonor += successfulDonationRule.points;
    } else {
      pointsToAwardDonor += 20; // Fallback
    }

    // Award Claimant
    if (pointsToAwardClaimant > 0) {
      await tx.rewardLedger.create({
        data: {
          userId: claimantId,
          transactionId,
          type: "EARN",
          points: pointsToAwardClaimant,
          reason: "Completed food rescue"
        }
      });
      await tx.reward.create({
        data: {
          userId: claimantId,
          transactionId,
          points: pointsToAwardClaimant,
          reason: "Completed food rescue"
        }
      });
    }

    // Award Donor
    if (pointsToAwardDonor > 0 && donorUserId) {
      await tx.rewardLedger.create({
        data: {
          userId: donorUserId,
          transactionId,
          type: "EARN",
          points: pointsToAwardDonor,
          reason: "Successful food donation"
        }
      });
      await tx.reward.create({
        data: {
          userId: donorUserId,
          transactionId,
          points: pointsToAwardDonor,
          reason: "Successful food donation"
        }
      });
    }

    await logAudit({
      actorId: null, // System action
      action: "PROCESS_REWARDS",
      entityType: "Transaction",
      entityId: transactionId,
      metadata: { claimantPoints: pointsToAwardClaimant, donorPoints: pointsToAwardDonor }
    });
  });
}
