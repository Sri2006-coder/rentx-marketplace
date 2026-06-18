import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment cannot exceed 1000 characters'),
});

export const getReviewsQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
  sort: z.enum(['newest', 'highest', 'lowest']).optional().default('newest'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
