"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const db_1 = require("../../config/db");
class AuthRepository {
    static async findUserByEmail(email) {
        return db_1.db.user.findUnique({ where: { email } });
    }
    static async findUserById(id) {
        return db_1.db.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                trustProfile: {
                    select: {
                        trustScore: true,
                        verifiedBadge: true,
                        aadhaarStatus: true,
                        panStatus: true,
                        emailVerified: true,
                        phoneVerified: true
                    }
                }
            }
        });
    }
    static async createUser(data) {
        return db_1.db.user.create({
            data: {
                ...data,
                trustProfile: {
                    create: {
                        trustScore: 0,
                        aadhaarStatus: 'UNVERIFIED',
                        panStatus: 'UNVERIFIED',
                        verifiedBadge: false,
                        emailVerified: false,
                        phoneVerified: false
                    }
                }
            }
        });
    }
}
exports.AuthRepository = AuthRepository;
