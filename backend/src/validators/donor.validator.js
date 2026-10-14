import { z } from "zod";

const latitudeSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

export const updateDonorProfileSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    contactName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    phone: z
      .string()
      .trim()
      .min(10)
      .max(20)
      .optional(),

    address: z
      .string()
      .trim()
      .min(3)
      .max(255)
      .optional(),
  })
  .strict();

export const createOutletSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Outlet name must contain at least 2 characters")
      .max(150),

    address: z
      .string()
      .trim()
      .min(3, "Address must contain at least 3 characters")
      .max(255),

    latitude: latitudeSchema,

    longitude: longitudeSchema,
  })
  .strict();

export const updateOutletSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Outlet name must contain at least 2 characters")
      .max(150)
      .optional(),

    address: z
      .string()
      .trim()
      .min(3, "Address must contain at least 3 characters")
      .max(255)
      .optional(),

    latitude: latitudeSchema.optional(),

    longitude: longitudeSchema.optional(),

    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      (data.latitude === undefined && data.longitude === undefined) ||
      (data.latitude !== undefined && data.longitude !== undefined),
    {
      message: "Latitude and longitude must be provided together",
      path: ["latitude"],
    }
  );