"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const availability_service_1 = require("./availability.service");
class AvailabilityController {
    static async blockDates(req, res, next) {
        try {
            const data = {
                blockedFrom: new Date(req.body.blockedFrom),
                blockedTo: new Date(req.body.blockedTo),
                reason: req.body.reason,
            };
            const block = await availability_service_1.AvailabilityService.blockDates(req.user.id, req.params.itemId, data);
            res.status(201).json({ success: true, data: block, message: 'Dates blocked successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async unblockDates(req, res, next) {
        try {
            await availability_service_1.AvailabilityService.unblockDates(req.user.id, req.params.itemId, req.params.id);
            res.status(200).json({ success: true, message: 'Dates unblocked successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAvailability(req, res, next) {
        try {
            const availability = await availability_service_1.AvailabilityService.getAvailability(req.params.itemId);
            res.status(200).json({ success: true, data: availability, message: 'Availability retrieved' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AvailabilityController = AvailabilityController;
