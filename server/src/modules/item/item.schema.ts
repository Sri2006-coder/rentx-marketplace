import { z } from 'zod';
import { ItemStatus } from '@prisma/client';

export const createItemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dailyRate: z.coerce.number().positive("Daily rate must be positive"),
  securityDeposit: z.coerce.number().positive("Security deposit must be positive"),
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().optional(),
  requireVerified: z.string().optional().transform(val => val === 'true'),
});

export const updateItemSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  dailyRate: z.coerce.number().positive().optional(),
  securityDeposit: z.coerce.number().positive().optional(),
  category: z.string().min(1).optional(),
  condition: z.string().min(1).optional(),
  city: z.string().min(2).optional(),
  state: z.string().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
  requireVerified: z.string().optional().transform(val => val === 'true'),
});

export const itemQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  ownerId: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemQueryInput = z.infer<typeof itemQuerySchema>;
