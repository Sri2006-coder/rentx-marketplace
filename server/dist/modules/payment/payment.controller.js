"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentHistory = exports.mockFailure = exports.mockSuccess = exports.createPaymentIntent = void 0;
const payment_service_1 = require("./payment.service");
const createPaymentIntent = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const payment = await payment_service_1.PaymentService.createPaymentIntent(bookingId, req.user.id);
        res.json({ success: true, payment });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
exports.createPaymentIntent = createPaymentIntent;
const mockSuccess = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await payment_service_1.PaymentService.mockPaymentSuccess(paymentId, req.user.id);
        res.json({ success: true, payment });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
exports.mockSuccess = mockSuccess;
const mockFailure = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await payment_service_1.PaymentService.mockPaymentFailure(paymentId, req.user.id);
        res.json({ success: true, payment });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
exports.mockFailure = mockFailure;
const getPaymentHistory = async (req, res) => {
    try {
        const history = await payment_service_1.PaymentService.getPaymentHistory(req.user.id);
        res.json({ success: true, payments: history });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
exports.getPaymentHistory = getPaymentHistory;
