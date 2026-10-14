import prisma from "../config/prisma.js";

export async function findDonorProfileByUserId(userId) {
  return prisma.donorProfile.findUnique({
    where: {
      userId,
    },
  });
}

export async function updateDonorProfile(userId, data) {
  return prisma.donorProfile.update({
    where: {
      userId,
    },
    data,
  });
}