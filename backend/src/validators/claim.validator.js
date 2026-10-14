import { z } from "zod";

export const createClaimSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
});