"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemQuerySchema = exports.updateItemSchema = exports.createItemSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Title must be at least 5 characters"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    dailyRate: zod_1.z.coerce.number().positive("Daily rate must be positive"),
    securityDeposit: zod_1.z.coerce.number().positive("Security deposit must be positive"),
    category: zod_1.z.string().min(1, "Category is required"),
    condition: zod_1.z.string().min(1, "Condition is required"),
    city: zod_1.z.string().min(2, 'City must be at least 2 characters'),
    state: zod_1.z.string().optional(),
    requireVerified: zod_1.z.string().optional().transform(val => val === 'true'),
});
exports.updateItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).optional(),
    description: zod_1.z.string().min(10).optional(),
    dailyRate: zod_1.z.coerce.number().positive().optional(),
    securityDeposit: zod_1.z.coerce.number().positive().optional(),
    category: zod_1.z.string().min(1).optional(),
    condition: zod_1.z.string().min(1).optional(),
    city: zod_1.z.string().min(2).optional(),
    state: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.ItemStatus).optional(),
    requireVerified: zod_1.z.string().optional().transform(val => val === 'true'),
});
exports.itemQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(50).default(10),
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    ownerId: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
});
