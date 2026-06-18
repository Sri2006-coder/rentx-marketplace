"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name must be at least 2 characters"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().regex(/^[a-z0-9.]+@gmail\.com$/, "Email must be a valid @gmail.com address (lowercase letters, numbers, and periods only)"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long")
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().regex(/^[a-z0-9.]+@(gmail\.com|rentx\.com)$/, "Email must be a valid @gmail.com address (lowercase letters, numbers, and periods only)"),
    password: zod_1.z.string().min(1, "Password is required")
});
