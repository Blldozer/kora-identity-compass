
import { z } from "zod";

export const registerFormSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{10,14}$/, "Please enter a valid phone number with country code (e.g., +12345678901)")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
