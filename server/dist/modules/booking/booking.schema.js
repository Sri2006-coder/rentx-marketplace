"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createBookingSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    notes: zod_1.z.string().optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
});
exports.updateBookingStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.BookingStatus),
});
