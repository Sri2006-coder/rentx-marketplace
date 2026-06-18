"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsQuerySchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(1, 'Comment is required').max(1000, 'Comment cannot exceed 1000 characters'),
});
exports.getReviewsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
    sort: zod_1.z.enum(['newest', 'highest', 'lowest']).optional().default('newest'),
});
