import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const createBookingSchema = z.object({
  itemId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  notes: z.string().optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});
