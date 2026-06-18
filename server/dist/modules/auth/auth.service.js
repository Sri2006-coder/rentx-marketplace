"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const AppError_1 = require("@/core/exceptions/AppError");
const jwt_1 = require("@/core/utils/jwt");
const password_1 = require("@/core/utils/password");
class AuthService {
    static async register(data) {
        const existingUser = await auth_repository_1.AuthRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new AppError_1.BadRequestError('User with this email already exists');
        }
        const passwordHash = await password_1.PasswordUtil.hash(data.password);
        const user = await auth_repository_1.AuthRepository.createUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            passwordHash,
        });
        const payload = { userId: user.id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        return {
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
            accessToken,
            refreshToken
        };
    }
    static async login(data) {
        const user = await auth_repository_1.AuthRepository.findUserByEmail(data.email);
        if (!user) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        const isPasswordValid = await password_1.PasswordUtil.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        const payload = { userId: user.id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        return {
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
            accessToken,
            refreshToken
        };
    }
    static async getMe(userId) {
        const user = await auth_repository_1.AuthRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.NotFoundError('User not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
