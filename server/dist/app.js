"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./api/routes/v1/auth.routes"));
const item_routes_1 = __importDefault(require("./modules/item/item.routes"));
const booking_routes_1 = __importDefault(require("./modules/booking/booking.routes"));
const review_routes_1 = __importDefault(require("./modules/review/review.routes"));
const wishlist_routes_1 = __importDefault(require("./modules/wishlist/wishlist.routes"));
const verification_routes_1 = __importDefault(require("./modules/verification/verification.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const chat_routes_1 = __importDefault(require("./modules/chat/chat.routes"));
const verification_controller_1 = require("./modules/verification/verification.controller");
const errorHandler_1 = require("./api/middlewares/errorHandler");
const cloudinary_1 = require("./config/cloudinary");
(0, cloudinary_1.verifyCloudinaryConnection)();
const app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
// Global Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/items', item_routes_1.default);
app.use('/api/v1/bookings', booking_routes_1.default);
app.use('/api/v1', review_routes_1.default);
app.use('/api/v1/wishlist', wishlist_routes_1.default);
app.use('/api/v1/verification', verification_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/chat', chat_routes_1.default);
// Custom user trust score route
app.get('/api/v1/users/:id/trust-score', verification_controller_1.VerificationController.getUserTrustScore);
// Health Check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
