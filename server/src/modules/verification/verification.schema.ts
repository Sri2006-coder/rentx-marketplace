import { z } from 'zod';

export const adminActionSchema = z.object({
  remarks: z.string().optional(),
});

export const requireVerifiedSchema = z.object({
  requireVerified: z.boolean()
});
