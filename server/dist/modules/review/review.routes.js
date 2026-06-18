"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("./review.controller");
const requireAuth_1 = require("@/api/middlewares/requireAuth");
const validate_1 = require("@/api/middlewares/validate");
const review_schema_1 = require("./review.schema");
const router = (0, express_1.Router)();
// POST /api/v1/reviews
router.post('/reviews', requireAuth_1.requireAuth, (0, validate_1.validate)(review_schema_1.createReviewSchema), review_controller_1.ReviewController.createReview);
// GET /api/v1/items/:id/reviews
router.get('/items/:id/reviews', review_controller_1.ReviewController.getReviewsForItem);
// GET /api/v1/users/:id/reviews
router.get('/users/:id/reviews', review_controller_1.ReviewController.getReviewsForUser);
// GET /api/v1/users/:id/reputation
router.get('/users/:id/reputation', review_controller_1.ReviewController.getUserReputation);
exports.default = router;
