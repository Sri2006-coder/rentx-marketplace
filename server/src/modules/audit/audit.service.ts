import { db } from '../../config/db';

export class AuditService {
  static async logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId?: string
  ) {
    try {
      await db.auditLog.create({
        data: {
          action,
          entityType,
          entityId,
          userId,
        },
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  static async getLogsForEntity(entityType: string, entityId: string) {
    return db.auditLog.findMany({
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
