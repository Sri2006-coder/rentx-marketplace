"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockDatesSchema = void 0;
const zod_1 = require("zod");
exports.blockDatesSchema = zod_1.z.object({
    blockedFrom: zod_1.z.string().datetime(),
    blockedTo: zod_1.z.string().datetime(),
    reason: zod_1.z.string().optional(),
}).refine((data) => new Date(data.blockedFrom) <= new Date(data.blockedTo), {
    message: "End date must be at or after start date",
    path: ["blockedTo"],
});
