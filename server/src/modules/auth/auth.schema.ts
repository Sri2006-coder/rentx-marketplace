import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().regex(/^[a-z0-9.]+@gmail\.com$/, "Email must be a valid @gmail.com address (lowercase letters, numbers, and periods only)"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export const loginSchema = z.object({
  email: z.string().regex(/^[a-z0-9.]+@(gmail\.com|rentx\.com)$/, "Email must be a valid @gmail.com address (lowercase letters, numbers, and periods only)"),
  password: z.string().min(1, "Password is required")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
