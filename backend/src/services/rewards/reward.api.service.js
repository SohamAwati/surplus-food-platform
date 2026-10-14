import prisma from "../../config/prisma.js";

export async function getMyRewards(userId) {
  const ledger = await prisma.rewardLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const totalPoints = ledger.reduce((acc, curr) => {
    if (curr.type === "EARN") return acc + curr.points;
    if (curr.type === "REDEEM" || curr.type === "EXPIRE") return acc - curr.points;
    return acc;
  }, 0);

  return { totalPoints, ledger };
}
