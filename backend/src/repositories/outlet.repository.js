import prisma from "../config/prisma.js";


export async function createOutlet({
  donorId,
  name,
  address,
  latitude,
  longitude,
}) {
  const rows = await prisma.$queryRaw`
    INSERT INTO outlets (
      id,
      "donorId",
      name,
      address,
      location,
      "isActive",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      gen_random_uuid(),
      ${donorId}::uuid,
      ${name},
      ${address},
      ST_SetSRID(
        ST_MakePoint(${longitude}, ${latitude}),
        4326
      )::geography,
      true,
      NOW(),
      NOW()
    )
    RETURNING
      id,
      "donorId",
      name,
      address,
      "isActive",
      "createdAt",
      "updatedAt";
  `;

  return getOutletById(rows[0].id);
}

export async function findOutletsByDonorId(donorId) {
  return prisma.$queryRaw`
    SELECT
      id,
      "donorId",
      name,
      address,
      "isActive",
      "createdAt",
      "updatedAt",
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude
    FROM outlets
    WHERE "donorId" = ${donorId}::uuid
    ORDER BY "createdAt" DESC;
  `;
}

export async function getOutletById(id) {
  const rows = await prisma.$queryRaw`
    SELECT
      id,
      "donorId",
      name,
      address,
      "isActive",
      "createdAt",
      "updatedAt",
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude
    FROM outlets
    WHERE id = ${id}::uuid
    LIMIT 1;
  `;

  return rows[0] ?? null;
}

export async function updateOutlet(
  id,
  { name, address, latitude, longitude, isActive }
) {
  const rows = await prisma.$queryRaw`
    UPDATE outlets
    SET
      name = COALESCE(${name ?? null}, name),
      address = COALESCE(${address ?? null}, address),
      location = CASE
        WHEN ${latitude ?? null}::double precision IS NOT NULL
         AND ${longitude ?? null}::double precision IS NOT NULL
        THEN ST_SetSRID(
          ST_MakePoint(
            ${longitude ?? null},
            ${latitude ?? null}
          ),
          4326
        )::geography
        ELSE location
      END,
      "isActive" = COALESCE(${isActive ?? null}, "isActive"),
      "updatedAt" = NOW()
    WHERE id = ${id}::uuid
    RETURNING id;
  `;

  if (!rows[0]) {
    return null;
  }

  return getOutletById(id);
}

export async function deleteOutlet(id) {
  const rows = await prisma.$queryRaw`
    DELETE FROM outlets
    WHERE id = ${id}::uuid
    RETURNING id;
  `;

  return rows[0] ?? null;
}