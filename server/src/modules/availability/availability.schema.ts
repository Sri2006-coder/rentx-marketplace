import { z } from 'zod';

export const blockDatesSchema = z.object({
  blockedFrom: z.string().datetime(),
  blockedTo: z.string().datetime(),
  reason: z.string().optional(),
}).refine((data) => new Date(data.blockedFrom) <= new Date(data.blockedTo), {
  message: "End date must be at or after start date",
  path: ["blockedTo"],
});
