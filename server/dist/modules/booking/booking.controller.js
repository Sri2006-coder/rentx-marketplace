"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const booking_service_1 = require("./booking.service");
class BookingController {
    static async requestBooking(req, res, next) {
        try {
            const booking = await booking_service_1.BookingService.requestBooking(req.user.id, req.body);
            res.status(201).json({ success: true, data: booking, message: 'Booking requested successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyRentals(req, res, next) {
        try {
            const bookings = await booking_service_1.BookingService.getMyRentals(req.user.id);
            res.status(200).json({ success: true, data: bookings, message: 'Rentals retrieved successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyIncomingRequests(req, res, next) {
        try {
            const bookings = await booking_service_1.BookingService.getMyIncomingRequests(req.user.id);
            res.status(200).json({ success: true, data: bookings, message: 'Incoming requests retrieved' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getBookingDetails(req, res, next) {
        try {
            const booking = await booking_service_1.BookingService.getBookingDetails(req.params.id);
            res.status(200).json({ success: true, data: booking, message: 'Booking details retrieved' });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, ...additionalData } = req.body;
            const booking = await booking_service_1.BookingService.updateStatus(id, req.user.id, status, additionalData);
            res.json({ success: true, data: booking, message: `Booking status updated to ${status}` });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}
exports.BookingController = BookingController;
