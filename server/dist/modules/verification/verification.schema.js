"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerifiedSchema = exports.adminActionSchema = void 0;
const zod_1 = require("zod");
exports.adminActionSchema = zod_1.z.object({
    remarks: zod_1.z.string().optional(),
});
exports.requireVerifiedSchema = zod_1.z.object({
    requireVerified: zod_1.z.boolean()
});
