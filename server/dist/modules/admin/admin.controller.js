"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
class AdminController {
    static async getDashboardMetrics(req, res, next) {
        try {
            const metrics = await admin_service_1.AdminService.getDashboardMetrics();
            res.json({ success: true, data: metrics });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUsers(req, res, next) {
        try {
            const users = await admin_service_1.AdminService.getUsers();
            res.json({ success: true, data: users });
        }
        catch (error) {
            next(error);
        }
    }
    static async suspendUser(req, res, next) {
        try {
            const user = await admin_service_1.AdminService.suspendUser(req.user.id, req.params.id);
            res.json({ success: true, data: user, message: 'User suspended' });
        }
        catch (error) {
            next(error);
        }
    }
    static async activateUser(req, res, next) {
        try {
            const user = await admin_service_1.AdminService.activateUser(req.user.id, req.params.id);
            res.json({ success: true, data: user, message: 'User activated' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getVerifications(req, res, next) {
        try {
            const verifications = await admin_service_1.AdminService.getVerifications();
            res.json({ success: true, data: verifications });
        }
        catch (error) {
            next(error);
        }
    }
    static async approveVerification(req, res, next) {
        try {
            const profile = await admin_service_1.AdminService.approveVerification(req.user.id, req.params.id);
            res.json({ success: true, data: profile, message: 'Verification approved' });
        }
        catch (error) {
            next(error);
        }
    }
    static async rejectVerification(req, res, next) {
        try {
            const profile = await admin_service_1.AdminService.rejectVerification(req.user.id, req.params.id);
            res.json({ success: true, data: profile, message: 'Verification rejected' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getItems(req, res, next) {
        try {
            const items = await admin_service_1.AdminService.getItems();
            res.json({ success: true, data: items });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateItemStatus(req, res, next) {
        try {
            const { status } = req.body;
            const item = await admin_service_1.AdminService.updateItemStatus(req.user.id, req.params.id, status);
            res.json({ success: true, data: item, message: `Item status updated to ${status}` });
        }
        catch (error) {
            next(error);
        }
    }
    static async getBookings(req, res, next) {
        try {
            const bookings = await admin_service_1.AdminService.getBookings();
            res.json({ success: true, data: bookings });
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelBooking(req, res, next) {
        try {
            const booking = await admin_service_1.AdminService.cancelBooking(req.user.id, req.params.id);
            res.json({ success: true, data: booking, message: 'Booking cancelled' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPayments(req, res, next) {
        try {
            const payments = await admin_service_1.AdminService.getPayments();
            res.json({ success: true, data: payments });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDisputes(req, res, next) {
        try {
            const disputes = await admin_service_1.AdminService.getDisputes();
            res.json({ success: true, data: disputes });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateDisputeStatus(req, res, next) {
        try {
            const { status, resolution } = req.body;
            const dispute = await admin_service_1.AdminService.updateDisputeStatus(req.user.id, req.params.id, status, resolution);
            res.json({ success: true, data: dispute, message: `Dispute updated to ${status}` });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const logs = await admin_service_1.AdminService.getAuditLogs();
            res.json({ success: true, data: logs });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
