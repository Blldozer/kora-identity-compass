
import { z } from "zod";

export const profileFormSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must not exceed 15 characters")
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email format").optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
