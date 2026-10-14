import prisma from "../../config/prisma.js";

export async function getGlobalImpact() {
  const closedTransactions = await prisma.transaction.findMany({
    where: { status: "CLOSED" },
    include: {
      listing: true,
      proof: true
    }
  });

  const activeListingsCount = await prisma.listing.count({
    where: { status: "POSTED" }
  });

  const expiredListingsCount = await prisma.listing.count({
    where: { status: "EXPIRED" }
  });

  let totalFoodRescuedKg = 0;
  let totalBeneficiaries = 0;
  let onTimeCount = 0;
  let overdueCount = 0;

  for (const t of closedTransactions) {
    if (t.listing.unit === "kg" && t.listing.quantity) {
      totalFoodRescuedKg += parseFloat(t.listing.quantity.toString());
    }
    if (t.proof && t.proof.beneficiaryCount) {
      totalBeneficiaries += t.proof.beneficiaryCount;
    }
    if (t.slaStatus === "ON_TIME" || t.slaStatus === "COMPLETED") {
      onTimeCount++;
    } else if (t.slaStatus === "OVERDUE") {
      overdueCount++;
    }
  }

  const completedDonationsCount = closedTransactions.length;
  const onTimeDeliveryRate = completedDonationsCount > 0 
    ? (onTimeCount / completedDonationsCount) * 100 
    : 100;

  return {
    totalFoodRescuedKg,
    completedDonationsCount,
    totalBeneficiaries,
    activeListingsCount,
    expiredListingsCount,
    onTimeDeliveryRate,
    overdueCount
  };
}

export async function getDonorImpact(donorUserId) {
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: donorUserId },
    include: { outlets: true }
  });

  if (!donorProfile) return null;
  const outletIds = donorProfile.outlets.map(o => o.id);

  const closedTransactions = await prisma.transaction.findMany({
    where: {
      status: "CLOSED",
      listing: {
        outletId: { in: outletIds }
      }
    },
    include: { listing: true, proof: true }
  });

  let totalFoodDonatedKg = 0;
  for (const t of closedTransactions) {
    if (t.listing.unit === "kg" && t.listing.quantity) {
      totalFoodDonatedKg += parseFloat(t.listing.quantity.toString());
    }
  }

  const activeListingsCount = await prisma.listing.count({
    where: { status: "POSTED", outletId: { in: outletIds } }
  });

  return {
    totalFoodDonatedKg,
    completedDonationsCount: closedTransactions.length,
    activeListingsCount
  };
}

export async function getNgoImpact(ngoUserId) {
  const closedTransactions = await prisma.transaction.findMany({
    where: {
      status: "CLOSED",
      claim: { claimantId: ngoUserId }
    },
    include: { listing: true, proof: true }
  });

  let totalFoodRescuedKg = 0;
  for (const t of closedTransactions) {
    if (t.listing.unit === "kg" && t.listing.quantity) {
      totalFoodRescuedKg += parseFloat(t.listing.quantity.toString());
    }
  }

  return {
    totalFoodRescuedKg,
    completedDonationsCount: closedTransactions.length
  };
}

export async function getVolunteerImpact(volunteerUserId) {
  return getNgoImpact(volunteerUserId); // Logic is essentially identical
}
