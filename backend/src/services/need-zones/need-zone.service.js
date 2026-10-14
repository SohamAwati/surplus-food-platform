import prisma from "../../config/prisma.js";

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function createNeedZone(userId, role, { name, description, priority, radiusMeters, lat, lng }) {
  if (role !== "ADMIN" && role !== "NGO") {
    throw serviceError("Only Admins and NGOs can create need zones.", 403);
  }

  let ngoId = null;
  if (role === "NGO") {
    const ngoProfile = await prisma.nGOProfile.findUnique({
      where: { userId: userId }
    });
    if (ngoProfile) {
      ngoId = ngoProfile.id;
    }
  }

  // Generate ID in application
  const id = crypto.randomUUID();

  // Use raw SQL to insert geometry point
  await prisma.$executeRaw`
    INSERT INTO need_zones (id, "ngoId", "createdById", name, description, priority, "radiusMeters", location, "isActive", "createdAt", "updatedAt")
    VALUES (
      ${id}::uuid,
      ${ngoId ? ngoId : null}::uuid,
      ${userId}::uuid,
      ${name},
      ${description},
      ${priority || 0},
      ${radiusMeters || 5000},
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
      true,
      now(),
      now()
    )
  `;

  // Fetch it back to return
  const [createdZone] = await prisma.$queryRaw`
    SELECT id, "ngoId", "createdById", name, description, priority, "radiusMeters", "isActive",
           ST_X(location::geometry) AS lng,
           ST_Y(location::geometry) AS lat
    FROM need_zones
    WHERE id = ${id}::uuid
  `;

  return createdZone;
}

export async function getNeedZones() {
  const zones = await prisma.$queryRaw`
    SELECT id, "ngoId", "createdById", name, description, priority, "radiusMeters", "isActive",
           ST_X(location::geometry) AS lng,
           ST_Y(location::geometry) AS lat
    FROM need_zones
    WHERE "isActive" = true
    ORDER BY priority DESC
  `;
  return zones;
}

export async function getNearbyListings(lat, lng, radiusMeters = 10000) {
  const listings = await prisma.$queryRaw`
    SELECT l.id, l.title, l.description, l.quantity, l.unit, l."expiresAt", l.status,
           o.name as "outletName",
           ST_X(o.location::geometry) AS lng,
           ST_Y(o.location::geometry) AS lat,
           ST_Distance(
             ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
             o.location
           ) AS "distanceMeters"
    FROM listings l
    JOIN outlets o ON l."outletId" = o.id
    WHERE l.status = 'POSTED'
      AND l."expiresAt" > now()
      AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
            o.location,
            ${radiusMeters}
          )
    ORDER BY "distanceMeters" ASC
  `;
  return listings;
}

export async function getActiveOutlets() {
  const outlets = await prisma.$queryRaw`
    SELECT o.id, o.name, o.address, o."isActive",
           ST_X(o.location::geometry) AS lng,
           ST_Y(o.location::geometry) AS lat,
           ST_X(o.location::geometry) AS longitude,
           ST_Y(o.location::geometry) AS latitude,
           dp."organizationName" AS "donorName"
    FROM outlets o
    LEFT JOIN donor_profiles dp ON o."donorId" = dp.id
    WHERE o."isActive" = true
    ORDER BY o.name ASC
  `;
  return outlets;
}
