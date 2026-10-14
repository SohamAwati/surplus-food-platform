import { z } from "zod";

const uuidSchema = z.string().uuid();

export const createListingSchema = z
  .object({
    outletId: uuidSchema,

    title: z
      .string()
      .trim()
      .min(2, "Listing title must be at least 2 characters.")
      .max(120, "Listing title cannot exceed 120 characters."),

    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters.")
      .optional()
      .or(z.literal("")),

    category: z
      .string()
      .trim()
      .max(100, "Category cannot exceed 100 characters.")
      .optional()
      .or(z.literal("")),

    quantity: z
      .number()
      .positive("Quantity must be greater than 0.")
      .optional(),

    unit: z
      .string()
      .trim()
      .max(30, "Unit cannot exceed 30 characters.")
      .optional()
      .or(z.literal("")),

    preparedAt: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),

    expiresAt: z
      .string()
      .datetime({
        offset: true,
      }),
  })
  .superRefine((data, ctx) => {
    const expiresAt = new Date(data.expiresAt);

    if (Number.isNaN(expiresAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Invalid expiry date.",
      });

      return;
    }

    if (expiresAt <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Expiry time must be in the future.",
      });
    }

    if (data.preparedAt) {
      const preparedAt = new Date(data.preparedAt);

      if (Number.isNaN(preparedAt.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preparedAt"],
          message: "Invalid preparation date.",
        });
      } else if (preparedAt > expiresAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preparedAt"],
          message:
            "Preparation time cannot be after the expiry time.",
        });
      }
    }
  });

export const updateListingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .or(z.literal("")),

    category: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal("")),

    quantity: z
      .number()
      .positive()
      .optional(),

    unit: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal("")),

    preparedAt: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),

    expiresAt: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.expiresAt) {
      return;
    }

    const expiresAt = new Date(data.expiresAt);

    if (expiresAt <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Expiry time must be in the future.",
      });
    }

    if (data.preparedAt) {
      const preparedAt = new Date(data.preparedAt);

      if (preparedAt > expiresAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preparedAt"],
          message:
            "Preparation time cannot be after the expiry time.",
        });
      }
    }
  });