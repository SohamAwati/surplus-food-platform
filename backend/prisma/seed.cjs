const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const USERS = {
  donor: "donor@surplus.local",
  ngo: "ngo@surplus.local",
  volunteer: "volunteer@surplus.local",
  admin: "admin@surplus.local",
};

async function main() {
  console.log("🌱 Starting Surplus database seed...");

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // ------------------------------------------------------------
  // USERS
  // ------------------------------------------------------------

  const donor = await prisma.user.upsert({
    where: { email: USERS.donor },
    update: {},
    create: {
      email: USERS.donor,
      passwordHash,
      role: "DONOR",
      verificationStatus: "VERIFIED",
    },
  });

  const ngo = await prisma.user.upsert({
    where: { email: USERS.ngo },
    update: {},
    create: {
      email: USERS.ngo,
      passwordHash,
      role: "NGO",
      verificationStatus: "VERIFIED",
    },
  });

  const volunteer = await prisma.user.upsert({
    where: { email: USERS.volunteer },
    update: {},
    create: {
      email: USERS.volunteer,
      passwordHash,
      role: "VOLUNTEER",
      verificationStatus: "VERIFIED",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: USERS.admin },
    update: {},
    create: {
      email: USERS.admin,
      passwordHash,
      role: "ADMIN",
      verificationStatus: "VERIFIED",
    },
  });

  // ------------------------------------------------------------
  // PROFILES
  // ------------------------------------------------------------

  const donorProfile = await prisma.donorProfile.upsert({
    where: { userId: donor.id },
    update: {},
    create: {
      userId: donor.id,
      organizationName: "PCCOE Campus Kitchen",
      contactName: "Surplus Donor",
      phone: "+919999999999",
      address: "Pimpri-Chinchwad, Pune",
    },
  });

  const ngoProfile = await prisma.nGOProfile.upsert({
    where: { userId: ngo.id },
    update: {},
    create: {
      userId: ngo.id,
      organizationName: "Hope Community Shelter",
      contactName: "Shelter Coordinator",
      phone: "+918888888888",
      address: "Pune, Maharashtra",
      beneficiaryCount: 120,
    },
  });

  await prisma.volunteerProfile.upsert({
    where: { userId: volunteer.id },
    update: {},
    create: {
      userId: volunteer.id,
      fullName: "Surplus Volunteer",
      phone: "+917777777777",
      vehicleType: "Two Wheeler",
      availability: true,
    },
  });

  // ------------------------------------------------------------
  // OUTLETS
  // ------------------------------------------------------------

  const outlet1 = await prisma.outlet.upsert({
    where: {
      id: "11111111-1111-4111-8111-111111111111",
    },
    update: {},
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      donorId: donorProfile.id,
      name: "PCCOE Main Canteen",
      address: "PCCOE, Nigdi, Pune",
    },
  });

  const outlet2 = await prisma.outlet.upsert({
    where: {
      id: "22222222-2222-4222-8222-222222222222",
    },
    update: {},
    create: {
      id: "22222222-2222-4222-8222-222222222222",
      donorId: donorProfile.id,
      name: "PCCOE Hostel Kitchen",
      address: "PCCOE Hostel Campus, Pune",
    },
  });

  // Pune approximate coordinates.
  await prisma.$executeRaw`
    UPDATE "outlets"
    SET "location" = ST_SetSRID(
      ST_MakePoint(73.8135, 18.6298),
      4326
    )::geography
    WHERE "id" = '11111111-1111-4111-8111-111111111111'
  `;

  await prisma.$executeRaw`
    UPDATE "outlets"
    SET "location" = ST_SetSRID(
      ST_MakePoint(73.8145, 18.6310),
      4326
    )::geography
    WHERE "id" = '22222222-2222-4222-8222-222222222222'
  `;

  // ------------------------------------------------------------
  // LISTINGS
  // ------------------------------------------------------------

  await prisma.listing.upsert({
    where: {
      id: "33333333-3333-4333-8333-333333333333",
    },
    update: {},
    create: {
      id: "33333333-3333-4333-8333-333333333333",
      outletId: outlet1.id,
      title: "Fresh Cooked Meals",
      description: "Fresh surplus meals available for redistribution.",
      category: "Cooked Food",
      quantity: 50,
      unit: "meals",
      preparedAt: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      status: "POSTED",
    },
  });

  await prisma.listing.upsert({
    where: {
      id: "44444444-4444-4444-8444-444444444444",
    },
    update: {},
    create: {
      id: "44444444-4444-4444-8444-444444444444",
      outletId: outlet1.id,
      title: "Packed Rice Meals",
      description: "Packed rice-based meals for community distribution.",
      category: "Rice",
      quantity: 30,
      unit: "packs",
      preparedAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      status: "POSTED",
    },
  });

  await prisma.listing.upsert({
    where: {
      id: "55555555-5555-4555-8555-555555555555",
    },
    update: {},
    create: {
      id: "55555555-5555-4555-8555-555555555555",
      outletId: outlet2.id,
      title: "Bakery Surplus",
      description: "Bread and bakery items remaining after daily operations.",
      category: "Bakery",
      quantity: 20,
      unit: "kg",
      preparedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
      status: "POSTED",
    },
  });

  // ------------------------------------------------------------
  // NEED ZONES
  // ------------------------------------------------------------

  const needZone1 = await prisma.needZone.upsert({
    where: {
      id: "66666666-6666-4666-8666-666666666666",
    },
    update: {},
    create: {
      id: "66666666-6666-4666-8666-666666666666",
      ngoId: ngoProfile.id,
      createdById: ngo.id,
      name: "Pimpri Community Zone",
      description: "Community shelter and nearby beneficiaries.",
      priority: 8,
      radiusMeters: 5000,
      isActive: true,
    },
  });

  const needZone2 = await prisma.needZone.upsert({
    where: {
      id: "77777777-7777-4777-8777-777777777777",
    },
    update: {},
    create: {
      id: "77777777-7777-4777-8777-777777777777",
      ngoId: ngoProfile.id,
      createdById: ngo.id,
      name: "Nigdi Distribution Zone",
      description: "Local food distribution requirement.",
      priority: 6,
      radiusMeters: 4000,
      isActive: true,
    },
  });

  await prisma.$executeRaw`
    UPDATE "need_zones"
    SET "location" = ST_SetSRID(
      ST_MakePoint(73.8130, 18.6305),
      4326
    )::geography
    WHERE "id" = '66666666-6666-4666-8666-666666666666'
  `;

  await prisma.$executeRaw`
    UPDATE "need_zones"
    SET "location" = ST_SetSRID(
      ST_MakePoint(73.8120, 18.6285),
      4326
    )::geography
    WHERE "id" = '77777777-7777-4777-8777-777777777777'
  `;

  // ------------------------------------------------------------
  // REWARD RULES
  // ------------------------------------------------------------

  await prisma.rewardRule.upsert({
    where: {
      id: "88888888-8888-4888-8888-888888888888",
    },
    update: {},
    create: {
      id: "88888888-8888-4888-8888-888888888888",
      name: "Successful Food Donation",
      description: "Reward for successfully completing a food donation.",
      points: 50,
      actionType: "DONATION_COMPLETED",
      isActive: true,
    },
  });

  await prisma.rewardRule.upsert({
    where: {
      id: "99999999-9999-4999-8999-999999999999",
    },
    update: {},
    create: {
      id: "99999999-9999-4999-8999-999999999999",
      name: "Volunteer Delivery",
      description: "Reward for completing a delivery.",
      points: 30,
      actionType: "DELIVERY_COMPLETED",
      isActive: true,
    },
  });

  console.log("");
  console.log("✅ Seed completed successfully.");
  console.log("");
  console.log("Development accounts:");
  console.log(`  Donor:     ${USERS.donor}`);
  console.log(`  NGO:       ${USERS.ngo}`);
  console.log(`  Volunteer: ${USERS.volunteer}`);
  console.log(`  Admin:     ${USERS.admin}`);
  console.log("");
  console.log("Password for all accounts: Password@123");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
