"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availability_controller_1 = require("./availability.controller");
const requireAuth_1 = require("../../api/middlewares/requireAuth");
const validate_1 = require("../../api/middlewares/validate");
const availability_schema_1 = require("./availability.schema");
// Note: This router is meant to be mounted under /api/v1/items/:itemId/availability
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/', availability_controller_1.AvailabilityController.getAvailability);
router.use(requireAuth_1.requireAuth);
router.post('/', (0, validate_1.validate)(availability_schema_1.blockDatesSchema), availability_controller_1.AvailabilityController.blockDates);
router.delete('/:id', availability_controller_1.AvailabilityController.unblockDates);
exports.default = router;
