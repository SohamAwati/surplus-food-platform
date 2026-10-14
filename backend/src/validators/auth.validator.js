import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Valid email is required").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must contain at least 6 characters")
    .max(72, "Password is too long"),
  role: z.enum(["DONOR", "NGO", "VOLUNTEER"]),
  name: z.string().trim().optional(),
  organizationName: z.string().trim().optional(),
  contactName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  vehicleType: z.string().trim().optional(),
  beneficiaryCount: z.union([z.number(), z.string()]).optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});