import { z } from 'zod';

export const addToWishlistSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
