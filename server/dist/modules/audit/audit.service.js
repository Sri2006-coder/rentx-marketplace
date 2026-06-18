"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const db_1 = require("@/config/db");
class AuditService {
    static async logAction(action, entityType, entityId, userId) {
        try {
            await db_1.db.auditLog.create({
                data: {
                    action,
                    entityType,
                    entityId,
                    userId,
                },
            });
        }
        catch (error) {
            console.error('Failed to log audit action:', error);
        }
    }
    static async getLogsForEntity(entityType, entityId) {
        return db_1.db.auditLog.findMany({
            where: {
                entityType,
                entityId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
}
exports.AuditService = AuditService;
