import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function findUserByEmail(email) {

  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

export async function createDonorProfile(data) {
  return prisma.donorProfile.create({
    data,
  });
}

export async function createNgoProfile(data) {
  return prisma.nGOProfile.create({
    data,
  });
}

export async function createVolunteerProfile(data) {
  return prisma.volunteerProfile.create({
    data,
  });
}