"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToWishlistSchema = void 0;
const zod_1 = require("zod");
exports.addToWishlistSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid('Invalid item ID'),
});
