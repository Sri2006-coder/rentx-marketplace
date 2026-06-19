"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_1 = require("../../core/utils/jwt");
const AppError_1 = require("../../core/exceptions/AppError");
const requireAuth = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new AppError_1.UnauthorizedError('Authentication token is missing');
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Assign user to req object according to our Express typings
        req.user = {
            id: payload.userId,
            role: payload.role, // casting as any to avoid importing Role enum from prisma here if preferred, or we can just let it be assigned since role is a string in payload
        };
        next();
    }
    catch (error) {
        if (error instanceof AppError_1.UnauthorizedError) {
            next(error);
        }
        else {
            next(new AppError_1.UnauthorizedError('Invalid or expired authentication token'));
        }
    }
};
exports.requireAuth = requireAuth;
const requireRole = (role) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            console.log('requireRole check:', { expectedRole: role, userRole: user?.role, user });
            if (!user) {
                throw new AppError_1.UnauthorizedError('User not authenticated');
            }
            if (user.role !== role) {
                res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
