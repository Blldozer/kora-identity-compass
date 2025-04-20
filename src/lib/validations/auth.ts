
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
  countryCode: z.string()
    .min(2, "Please select a country code"),
  phoneNumber: z.string()
    .min(4, "Phone number must be at least 4 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\d+$/, "Please enter only numbers"),
  country: z.string()
    .min(2, "Please select a country"),
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
